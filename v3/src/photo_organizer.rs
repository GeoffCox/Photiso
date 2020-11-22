use crate::file_hash::*;
use crate::photo_date_time::*;
use std::{cell::Cell, ffi::OsString, fs, io, path::Path, path::PathBuf};

#[doc(hidden)]
pub use anyhow::*;

pub enum PhotisoEvent<'a> {
    DirStarted {
        dir: &'a Path,
    },
    DirFinished {
        dir: &'a Path,
    },
    FileStarted {
        file: &'a Path,
    },
    FileFinished {
        file: &'a Path,
    },
    FileError {
        file: &'a Path,
        error: anyhow::Error,
    },
    FileMoved {
        from: &'a Path,
        to: &'a Path,
    },
    FileNoOp {
        file: &'a Path,
    },
    DuplicateFileMoved {
        from: &'a Path,
        to: &'a Path,
    },
    FileSkipped {
        file: &'a Path,
        reason: String,
    },
}

pub fn organize(
    unorganized_dir: &Path,
    organized_dir: &Path,
    duplicates_dir: &Path,
    event_handler: Box<dyn Fn(PhotisoEvent) -> bool>,
) -> anyhow::Result<()> {
    let organizer = Organizer::new(
        unorganized_dir,
        organized_dir,
        duplicates_dir,
        event_handler,
    )?;

    Ok(organizer.organize()?)
}

#[doc(hidden)]
pub struct Organizer {
    unorganized_dir: PathBuf,
    organized_dir: PathBuf,
    duplicates_dir: PathBuf,
    event_handler: Box<dyn Fn(PhotisoEvent) -> bool>,
    canceled: Cell<bool>,
}

#[doc(hidden)]
impl Organizer {
    /// Create a new instance of the organizer
    #[doc(hidden)]
    pub fn new(
        unorganized_dir: &Path,
        organized_dir: &Path,
        duplicates_dir: &Path,
        event_handler: Box<dyn Fn(PhotisoEvent) -> bool>,
    ) -> anyhow::Result<Organizer> {
        let canonical_unorganized_dir = fs::canonicalize(unorganized_dir)?;
        let canonical_organized_dir = fs::canonicalize(organized_dir)?;
        let canonical_duplicates_dir = fs::canonicalize(duplicates_dir)?;

        ensure!(
            canonical_unorganized_dir != canonical_duplicates_dir,
            "The unorganized directory and duplicates directory cannot be the the same directory."
        );
        ensure!(
            canonical_organized_dir != canonical_duplicates_dir,
            "The organized directory and duplicates directory cannot be the the same directory."
        );

        Ok(Organizer {
            unorganized_dir: canonical_unorganized_dir,
            organized_dir: canonical_organized_dir,
            duplicates_dir: canonical_duplicates_dir,
            event_handler,
            canceled: Cell::new(false),
        })
    }

    /// Organized the unorganized directory of photos, placing them into the organized directory.
    /// Any duplicate photos are moved to the duplicates directory.
    #[doc(hidden)]
    pub fn organize(&self) -> anyhow::Result<()> {
        self.canceled.set(false);
        self.organize_directory(&self.unorganized_dir)?;
        Ok(())
    }

    #[doc(hidden)]
    fn on_event(&self, event: PhotisoEvent) {
        if !(self.event_handler)(event) {
            self.canceled.set(true);
        }
    }

    #[doc(hidden)]
    fn organize_directory(&self, dir_path: &Path) -> anyhow::Result<()> {
        // do not process the duplicates directory
        if dir_path == self.duplicates_dir {
            return Ok(());
        }

        self.on_event(PhotisoEvent::DirStarted { dir: dir_path });

        let mut entries = fs::read_dir(&dir_path)?
            .map(|res| res.map(|e| e.path()))
            .collect::<Result<Vec<_>, io::Error>>()?;
        entries.sort();

        // organize files in this directory
        for e in entries.iter().filter(|e| e.is_file()) {
            match self.organize_file(&e) {
                Ok(_) => {}
                Err(err) => self.on_event(PhotisoEvent::FileError {
                    file: &e,
                    error: err,
                }),
            }
        }

        // organize child directories
        for e in entries.iter().filter(|e| e.is_dir()) {
            self.organize_directory(&e)?;
        }

        self.on_event(PhotisoEvent::DirFinished { dir: dir_path });

        Ok(())
    }

    #[doc(hidden)]
    fn organize_file(&self, file_path: &Path) -> anyhow::Result<()> {
        self.on_event(PhotisoEvent::FileStarted { file: file_path });

        if self.canceled.get() {
            return Ok(());
        }

        // only handle files with photo extensions
        if !is_photo_file(file_path) {
            self.on_event(PhotisoEvent::FileSkipped {
                file: file_path,
                reason: String::from("Not a photo."),
            });
            return Ok(());
        }

        // never move a file with ! in the name
        if file_path
            .file_stem()
            .unwrap()
            .to_str()
            .unwrap()
            .contains("!")
        {
            self.on_event(PhotisoEvent::FileSkipped {
                file: file_path,
                reason: String::from("Photo file name contains '!'."),
            });
            return Ok(());
        }

        let photo_date_time_info = PhotoDateTimeInfo::load(file_path)?;
        let photo_date_time = photo_date_time_info.best();

        let mut conflict = 0;
        loop {
            // check for cancellation at the start of each iteration
            if self.canceled.get() {
                return Ok(());
            }

            let dest_path = get_photo_destination_path(
                file_path,
                &photo_date_time,
                conflict,
                &self.organized_dir,
            )?;

            // if the file is already in the right place, do nothing
            if file_path.to_str() == dest_path.to_str() {
                self.on_event(PhotisoEvent::FileNoOp { file: file_path });

                if self.canceled.get() {
                    return Ok(());
                }

                break;
            }

            // if there is already a file in this location,
            if dest_path.exists() {
                match are_same_file_contents(file_path, &dest_path)? {
                    Some(hash) => {
                        self.organize_duplicate(file_path, &photo_date_time, &hash)?;
                        break;
                    }
                    None => {
                        // if there is a different file in this location, try again with a higher conflict number
                        conflict += 1;
                        continue;
                    }
                }
            } else {
                // move the file to the destination
                move_file(file_path, dest_path.as_ref())?;
                self.on_event(PhotisoEvent::FileMoved {
                    from: file_path,
                    to: &dest_path,
                });
                break;
            }
        }

        self.on_event(PhotisoEvent::FileFinished { file: file_path });

        Ok(())
    }

    #[doc(hidden)]
    fn organize_duplicate(
        &self,
        file_path: &Path,
        date_time: &chrono::DateTime<Utc>,
        hash: &str,
    ) -> anyhow::Result<()> {
        let mut conflict = 0;
        loop {
            // check for cancellation at the start of each iteration
            if self.canceled.get() {
                return Ok(());
            }

            let dest_path = get_photo_duplicates_path(
                file_path,
                date_time,
                hash,
                conflict,
                &self.duplicates_dir,
            )?;

            // if the duplicate is already in the right place, do nothing
            if file_path.to_str() == dest_path.to_str() {
                self.on_event(PhotisoEvent::FileNoOp { file: file_path });
                break;
            }

            // if there is an existing duplicate, try again with a higher conflict number
            if dest_path.exists() {
                conflict += 1;
                continue;
            }

            // move the duplicate to the destination
            move_file(file_path, dest_path.as_ref())?;
            self.on_event(PhotisoEvent::DuplicateFileMoved {
                from: file_path,
                to: &dest_path,
            });
            break;
        }

        Ok(())
    }
}

#[doc(hidden)]
fn is_photo_file(path: &Path) -> bool {
    if path.exists() && path.is_file() {
        if let Some(ext) = path.extension() {
            if let Some(str_ext) = ext.to_str() {
                match str_ext.to_lowercase().as_str() {
                    "bmp" => return true,
                    "gif" => return true,
                    "jpg" => return true,
                    "jpeg" => return true,
                    "png" => return true,
                    "tif" => return true,
                    "tiff" => return true,
                    "wmp" => return true,
                    _ => return false,
                }
            }
        }
    }

    false
}

#[doc(hidden)]
fn get_photo_destination_path(
    file_path: &Path,
    date_time: &chrono::DateTime<Utc>,
    conflict: u32,
    organized_dir: &Path,
) -> anyhow::Result<PathBuf> {
    // folder path is '(organized)year/month' (i.e. YYYY/MM)
    let mut dest_path = PathBuf::from(organized_dir);
    dest_path.push(PathBuf::from(date_time.format("%Y").to_string()).as_path());
    dest_path.push(PathBuf::from(date_time.format("%m").to_string()).as_path());

    // file name is 'year-month-day hour-minute-second-fractionOfSeconds conflict' (i.e. YYYY-MM-DD HH-MM-SS-FFFFFFFFF CCC)
    let mut file_name = date_time.format("%Y-%m-%d %H-%M-%S-%f").to_string();

    // add .jpg to the end so that set_extension doesn't overwrite the last part
    if conflict > 0 {
        file_name = format!("{} {:03}.jpg", file_name, conflict);
    } else {
        file_name = format!("{}.jpg", file_name);
    }

    dest_path.push(PathBuf::from(file_name).as_path());

    // extension is maintained, but made lowercase for consistency
    let extension = OsString::from(
        file_path
            .extension()
            .unwrap()
            .to_str()
            .unwrap()
            .to_lowercase(),
    );

    dest_path.set_extension(extension);

    return Ok(dest_path);
}

#[doc(hidden)]
fn get_photo_duplicates_path(
    file_path: &Path,
    date_time: &chrono::DateTime<Utc>,
    hash: &str,
    conflict: u32,
    duplicates_dir: &Path,
) -> anyhow::Result<PathBuf> {
    // folder path is (duplicates)year/month (i.e. YYYY/MM)
    let mut dest_path = PathBuf::from(duplicates_dir);
    dest_path.push(PathBuf::from(date_time.format("%Y").to_string()).as_path());
    dest_path.push(PathBuf::from(date_time.format("%m").to_string()).as_path());

    // file name is 'hash conflict'
    let mut file_name = format!("{}", hash);

    // add .jpg to the end so that set_extension doesn't overwrite the last part
    if conflict > 0 {
        file_name = format!("{}.{:03}.jpg", file_name, conflict);
    } else {
        file_name = format!("{}.jpg", file_name);
    }

    dest_path.push(PathBuf::from(file_name).as_path());

    // extension is maintained, but made lowercase for consistency
    let extension = OsString::from(
        file_path
            .extension()
            .unwrap()
            .to_str()
            .unwrap()
            .to_lowercase(),
    );
    dest_path.set_extension(extension);

    return Ok(dest_path);
}

// returns the file hash if both files has the same length and hash values
#[doc(hidden)]
fn are_same_file_contents(x: &Path, y: &Path) -> anyhow::Result<Option<String>> {
    let x_len = fs::metadata(x)?.len();
    let y_len = fs::metadata(y)?.len();

    if x_len != y_len {
        return Ok(None);
    }

    let x_hash = get_file_hash(x)?;
    let y_hash = get_file_hash(y)?;

    if x_hash != y_hash {
        return Ok(None);
    }

    return Ok(Some(x_hash));
}

#[doc(hidden)]
fn move_file(from: &Path, to: &Path) -> io::Result<()> {
    let from_dir = to.parent().unwrap();
    fs::create_dir_all(from_dir)?;
    fs::rename(from, to)?;

    Ok(())
}
