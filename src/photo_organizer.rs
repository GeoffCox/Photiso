use crate::file_hash::*;
use crate::photo_date_time::*;
use std::{
    cell::Cell,
    ffi::OsString,
    fs, io,
    path::Path,
    path::PathBuf,
    time::{Duration, Instant},
};

#[doc(hidden)]
pub use anyhow::*;

/// An event raised as photos are organized.
pub enum OrganizeEvent<'a> {
    /// Raised when processing an unorganized directory starts.
    DirStarted { dir: &'a Path },
    /// Raised when processing an unorganized directory finishes.
    DirFinished { dir: &'a Path },
    /// Raised when a directory is skipped.
    DirSkipped { dir: &'a Path, reason: &'a str },
    /// Raised when processing an unorganized file starts.
    FileStarted { file: &'a Path },
    /// Raised when processing an unorganized file finishes.
    FileFinished { file: &'a Path },
    /// Raised when file is skipped.
    FileSkipped { file: &'a Path, reason: &'a str },
    /// Raised when there is an error processing a file.
    FileError {
        file: &'a Path,
        error: anyhow::Error,
    },
    /// Raised when photo is moved to its organized location.
    PhotoMoved { from: &'a Path, to: &'a Path },
    /// Raised when duplicate photo is moved to its duplicates location.
    DuplicatePhotoMoved { from: &'a Path, to: &'a Path },
    /// Raised when photo is already at its organized location.
    PhotoNoOp { file: &'a Path },
}

#[derive(Clone, Debug)]
pub struct OrganizeResult {
    pub dirs: u64,
    pub dirs_skipped: u64,
    pub files: u64,
    pub files_skipped: u64,
    pub files_errored: u64,
    pub photos_moved: u64,
    pub duplicate_photos_moved: u64,
    pub photos_noop: u64,
    pub duration: Duration,
}

/// Organizes photos
///
/// # Arguments
///
/// * `unorganized_dir` - The directory containing the photos that need to be organized.
/// * `organized_dir` - The directory where organized photos should be placed.
/// * `duplicates_dir` - The directory where exact duplicate photos should be placed.
/// * `event_handler` - The handler for listening to events as organize progreses.
///
/// To organize photos _in place_, pass the same directory for `unorganized_dir` and `organized_dir`.
///
/// The `duplicates_dir` cannot be the same directory as `unorganized_dir` nor `organized_dir`.
///
/// If the `event_handler` returns true, organize continues; otherwise organize will stop processing files and return.
///
/// # Organization Details
///
/// Only files with an extension of bmp, gif, jpg, jpeg, png, tif, tiff, or wmp are processed. Others are skipped.
///
/// If a filename contains an exclamation point `!`, it will be skipped.
///
pub fn organize<F>(
    unorganized_dir: &Path,
    organized_dir: &Path,
    duplicates_dir: &Path,
    event_handler: F,
) -> anyhow::Result<OrganizeResult>
where
    F: Fn(OrganizeEvent) -> bool,
{
    // each of the directories must exist, otherwise canonicalize will fail.
    if !unorganized_dir.exists() {
        fs::create_dir_all(&unorganized_dir)?;
    }

    if !organized_dir.exists() {
        fs::create_dir_all(&organized_dir)?;
    }

    if !&duplicates_dir.exists() {
        fs::create_dir_all(&duplicates_dir)?;
    }

    let organizer = Organizer::new(
        unorganized_dir,
        organized_dir,
        duplicates_dir,
        event_handler,
    )?;

    Ok(organizer.organize()?)
}

struct OrganizerParams<F>
where
    F: Fn(OrganizeEvent) -> bool,
{
    unorganized_dir: PathBuf,
    organized_dir: PathBuf,
    duplicates_dir: PathBuf,

    event_handler: F,
}

struct OrganizeCounters {
    dirs: Cell<u64>,
    dirs_skipped: Cell<u64>,
    files: Cell<u64>,
    files_skipped: Cell<u64>,
    files_errored: Cell<u64>,
    photos_moved: Cell<u64>,
    duplicate_photos_moved: Cell<u64>,
    photos_noop: Cell<u64>,
}

#[doc(hidden)]
struct Organizer<F>
where
    F: Fn(OrganizeEvent) -> bool,
{
    params: OrganizerParams<F>,

    unorganized_dir: PathBuf,
    organized_dir: PathBuf,
    duplicates_dir: PathBuf,

    counters: OrganizeCounters,
    canceled: Cell<bool>,
}

#[doc(hidden)]
impl<F> Organizer<F>
where
    F: Fn(OrganizeEvent) -> bool,
{
    /// Create a new instance of the organizer
    pub fn new(
        unorganized_dir: &Path,
        organized_dir: &Path,
        duplicates_dir: &Path,
        event_handler: F,
    ) -> anyhow::Result<Organizer<F>> {
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
            params: OrganizerParams {
                unorganized_dir: unorganized_dir.to_path_buf(),
                organized_dir: organized_dir.to_path_buf(),
                duplicates_dir: duplicates_dir.to_path_buf(),
                event_handler,
            },
            unorganized_dir: canonical_unorganized_dir,
            organized_dir: canonical_organized_dir,
            duplicates_dir: canonical_duplicates_dir,
            counters: OrganizeCounters {
                dirs: Cell::new(0),
                dirs_skipped: Cell::new(0),
                files: Cell::new(0),
                photos_moved: Cell::new(0),
                duplicate_photos_moved: Cell::new(0),
                photos_noop: Cell::new(0),
                files_skipped: Cell::new(0),
                files_errored: Cell::new(0),
            },
            canceled: Cell::new(false),
        })
    }

    /// Organize the unorganized directory of photos, placing photos to their organized location.
    /// Any duplicate photos are moved to the duplicates directory.
    pub fn organize(&self) -> anyhow::Result<OrganizeResult> {
        self.canceled.set(false);

        let timer = Instant::now();
        self.organize_directory((&self).unorganized_dir.as_ref())?;
        let duration = timer.elapsed();

        Ok(OrganizeResult {
            dirs: self.counters.dirs.get(),
            dirs_skipped: self.counters.dirs_skipped.get(),
            files: self.counters.files.get(),
            photos_moved: self.counters.photos_moved.get(),
            duplicate_photos_moved: self.counters.duplicate_photos_moved.get(),
            photos_noop: self.counters.photos_noop.get(),
            files_skipped: self.counters.files_skipped.get(),
            files_errored: self.counters.files_errored.get(),
            duration,
        })
    }

    fn organize_directory(&self, dir: &Path) -> anyhow::Result<()> {
        // do not process the duplicates directory
        if dir == self.duplicates_dir {
            self.raise_dir_skipped(dir, "Directory is the duplicates directory.");
            return Ok(());
        }

        self.raise_dir_started(dir);

        let mut entries = fs::read_dir(dir)?
            .map(|res| res.map(|e| e.path()))
            .collect::<Result<Vec<_>, io::Error>>()?;
        entries.sort();

        // organize files in this directory
        for e in entries.iter().filter(|e| e.is_file()) {
            match self.organize_file(&e) {
                Ok(_) => {}
                Err(err) => self.raise_file_error(&e, err),
            }
        }

        // organize child directories
        for e in entries.iter().filter(|e| e.is_dir()) {
            self.organize_directory(&e)?;
        }

        self.raise_dir_finished(dir);

        Ok(())
    }

    fn organize_file(&self, file_path: &Path) -> anyhow::Result<()> {
        self.raise_file_started(file_path);

        if self.canceled.get() {
            return Ok(());
        }

        // only handle files with photo extensions
        if !is_photo_file(file_path) {
            self.raise_file_skipped(file_path, "File does not have a photo extension.");
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
            self.raise_file_skipped(file_path, "File name contains '!'.");
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

            let dest_path = get_organized_photo_path(
                file_path,
                &photo_date_time,
                conflict,
                &self.organized_dir,
            )?;

            // if the file is already in the right place, do nothing
            if file_path.to_str() == dest_path.to_str() {
                self.raise_file_noop(file_path);

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
                self.raise_file_moved(file_path, &dest_path);
                break;
            }
        }

        self.raise_file_finished(file_path);

        Ok(())
    }

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

            let dest_path = get_duplicate_photo_path(
                file_path,
                date_time,
                hash,
                conflict,
                &self.duplicates_dir,
            )?;

            // if the duplicate is already in the right place, do nothing
            if file_path.to_str() == dest_path.to_str() {
                self.raise_file_noop(file_path);
                break;
            }

            // if there is an existing duplicate, try again with a higher conflict number
            if dest_path.exists() {
                conflict += 1;
                continue;
            }

            // move the duplicate to the destination
            move_file(file_path, &dest_path)?;
            self.raise_duplicate_moved(file_path, &dest_path);
            break;
        }

        Ok(())
    }

    // -------------------- Events --------------------//

    fn raise_dir_started(&self, dir: &Path) {
        self.on_event(OrganizeEvent::DirStarted {
            dir: &decry_path(dir, &self.unorganized_dir, &self.params.unorganized_dir),
        });
    }

    fn raise_dir_finished(&self, dir: &Path) {
        increment(&self.counters.dirs);
        self.on_event(OrganizeEvent::DirFinished {
            dir: &decry_path(dir, &self.unorganized_dir, &self.params.unorganized_dir),
        });
    }

    fn raise_dir_skipped(&self, dir: &Path, reason: &str) {
        increment(&self.counters.dirs_skipped);
        self.on_event(OrganizeEvent::DirSkipped {
            dir: &decry_path(dir, &self.unorganized_dir, &self.params.unorganized_dir),
            reason,
        });
    }

    fn raise_file_started(&self, file: &Path) {
        self.on_event(OrganizeEvent::FileStarted {
            file: &decry_path(file, &self.unorganized_dir, &self.params.unorganized_dir),
        });
    }

    fn raise_file_finished(&self, file: &Path) {
        increment(&self.counters.files);
        self.on_event(OrganizeEvent::FileFinished {
            file: &decry_path(file, &self.unorganized_dir, &self.params.unorganized_dir),
        });
    }

    fn raise_file_moved(&self, from: &Path, to: &Path) {
        increment(&self.counters.photos_moved);
        self.on_event(OrganizeEvent::PhotoMoved {
            from: &decry_path(from, &self.unorganized_dir, &self.params.unorganized_dir),
            to: &decry_path(to, &self.organized_dir, &self.params.organized_dir),
        });
    }

    fn raise_file_noop(&self, file: &Path) {
        increment(&self.counters.photos_noop);
        self.on_event(OrganizeEvent::PhotoNoOp {
            file: &decry_path(file, &self.unorganized_dir, &self.params.unorganized_dir),
        });
    }

    fn raise_duplicate_moved(&self, from: &Path, to: &Path) {
        increment(&self.counters.duplicate_photos_moved);
        self.on_event(OrganizeEvent::DuplicatePhotoMoved {
            from: &decry_path(from, &self.unorganized_dir, &self.params.unorganized_dir),
            to: &decry_path(to, &self.duplicates_dir, &self.params.duplicates_dir),
        });
    }

    fn raise_file_skipped(&self, file: &Path, reason: &str) {
        increment(&self.counters.files_skipped);
        self.on_event(OrganizeEvent::FileSkipped {
            file: &decry_path(file, &self.unorganized_dir, &self.params.unorganized_dir),
            reason,
        });
    }

    fn raise_file_error(&self, file: &Path, error: anyhow::Error) {
        increment(&self.counters.files_errored);
        self.on_event(OrganizeEvent::FileError {
            file: &decry_path(file, &self.unorganized_dir, &self.params.unorganized_dir),
            error,
        });
    }

    fn on_event(&self, event: OrganizeEvent) {
        if !(self.params.event_handler)(event) {
            self.canceled.set(true);
        }
    }
}

/// Determines if a file is a photo by inspecting the extension
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
fn get_organized_photo_path(
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
fn get_duplicate_photo_path(
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

/// Returns true if the files are the same length and the file hases are equal
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
    if let Some(to_dir) = to.parent() {
        fs::create_dir_all(to_dir)?;
    }

    fs::rename(from, to)?;

    Ok(())
}

/// The reverse of fs::canonicalize.  Returns the path with the lay base instead of the the cannonical base.
#[doc(hidden)]
fn decry_path(canonical_path: &Path, canonical_base: &Path, lay_base: &Path) -> PathBuf {
    match canonical_path.strip_prefix(canonical_base) {
        Ok(partial) => lay_base.join(partial),
        _ => canonical_path.to_path_buf(),
    }
}

#[doc(hidden)]
fn increment(cell: &Cell<u64>) {
    cell.set(cell.get() + 1)
}
