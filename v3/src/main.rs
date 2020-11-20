mod config;
mod file_hash;
mod photo_date_time;

use crate::config::*;
use crate::file_hash::*;
use crate::photo_date_time::*;

use std::{ffi::OsString, fs, io, path::Path, path::PathBuf};

fn main() -> anyhow::Result<()> {
    println!("----------------------------------------");
    println!("Photiso");

    let config: Config = load_config()?;

    println!("config: {:?}", config);
    println!("----------------------------------------");

    let unorganized_dir = Path::new(&config.directories.unorganized);
    organize_directory(&unorganized_dir, &config)?;

    println!("----------------------------------------");

    Ok(())
}

fn organize_directory(dir_path: &Path, config: &Config) -> anyhow::Result<()> {
    // Do not process the duplicates directory
    if dir_path == config.directories.duplicates {
        return Ok(());
    }

    on_directory_started(dir_path);

    let mut entries = fs::read_dir(&dir_path)?
        .map(|res| res.map(|e| e.path()))
        .collect::<Result<Vec<_>, io::Error>>()?;
    entries.sort();

    // organize files in this directory
    for e in entries.iter().filter(|e| is_photo_file(&e)) {
        organize_photo_file(&e, config)?;
    }

    // organize child directories
    for e in entries.iter().filter(|e| e.is_dir()) {
        organize_directory(&e, config)?;
    }

    on_directory_finished(dir_path);

    Ok(())
}

fn organize_photo_file(file_path: &Path, config: &Config) -> anyhow::Result<()> {
    on_file_started(file_path);

    let photo_date_time = get_photo_date_time(file_path)?;

    let mut conflict = 0;
    loop {
        let dest_path = get_photo_destination_path(file_path, &photo_date_time, conflict, config)?;

        if file_path.to_str() == dest_path.to_str() {
            on_file_no_op(file_path);
            break;
        }

        if dest_path.exists() {
            //let dest_photo_date_time = get_photo_date_time(&dest_path)?;

            let from_hash = file_hash::get_file_hash(file_path)?;
            let to_hash = file_hash::get_file_hash(&dest_path)?;

            if from_hash.hash == to_hash.hash {
                //TODO: Move to duplicates?
                on_duplicate_moved(file_path, &dest_path);
                break;
            }

            conflict += 1;
            continue;
        }

        move_file(file_path, dest_path.as_ref())?;
        on_file_moved(file_path, &dest_path);
        break;
    }

    on_file_finished(file_path);
    Ok(())
}

fn move_file(from: &Path, to: &Path) -> io::Result<()> {
    let from_dir = to.parent().unwrap();
    fs::create_dir_all(from_dir)?;
    fs::rename(from, to)?;

    Ok(())
}

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

fn get_photo_destination_path(
    file_path: &Path,
    date_time: &chrono::DateTime<Utc>,
    conflict: u32,
    config: &Config,
) -> anyhow::Result<PathBuf> {
    let extension = OsString::from(
        file_path
            .extension()
            .unwrap()
            .to_str()
            .unwrap()
            .to_lowercase(),
    );

    let year = date_time.format("%Y").to_string();
    let month = date_time.format("%m").to_string();
    let mut file_name = date_time.format("%Y-%m-%d %H.%M.%S.%f").to_string();

    if conflict > 0 {
        file_name = format!("{}.{:03}.jpg", file_name, conflict);
    } else {
        file_name = format!("{}.jpg", file_name);
    }

    let mut file_path = PathBuf::from(&config.directories.organized);
    file_path.push(PathBuf::from(year).as_path());
    file_path.push(PathBuf::from(month).as_path());
    file_path.push(PathBuf::from(file_name).as_path());
    file_path.set_extension(extension);

    return Ok(file_path);
}

// called when procesing a directory starts
fn on_directory_started(_dir: &Path) {}

// called when procesing a directory finishes
fn on_directory_finished(_dir: &Path) {}

// called when procesing a file starts
fn on_file_started(_file: &Path) {}

// called when procesing a file finishes
fn on_file_finished(_file: &Path) {}

// called when a file is moved
fn on_file_moved(_from: &Path, _to: &Path) {
    print!("M");
}

// called when a duplicate file is found and moved
fn on_duplicate_moved(_from: &Path, _to: &Path) {
    print!("D");
}

// called when a file is already in its correct location
fn on_file_no_op(_file: &Path) {
    print!("-");
}

// called when a file is skipped (not a photo)
fn on_file_skipped(_file: &Path) {
    print!("S");
}

// called when there is a problem processing a file
fn on_file_error(_file: &Path) {
    print!("E");
}
