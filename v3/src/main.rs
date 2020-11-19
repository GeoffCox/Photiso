mod config;
mod photo_info;

use crate::config::*;
use crate::photo_info::*;

use std::{fs, io, path::Path, path::PathBuf};

fn main() -> anyhow::Result<()> {
    println!("Hello Photiso");

    let config: Config = load_config()?;

    println!("config: {:?}", config);

    let unorganized_dir = Path::new(&config.directories.unorganized);
    organize_directory(&unorganized_dir, &config)?;

    Ok(())
}

fn organize_directory(dir_path: &Path, config: &Config) -> anyhow::Result<()> {
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

    Ok(())
}

fn organize_photo_file(file_path: &Path, config: &Config) -> anyhow::Result<()> {
    //print_all_exif(file_path)?;

    let photo_info = get_photo_info(file_path)?;
    println!("  photo_info: {:?}", photo_info);

    let dest_dir = get_photo_destination_directory(&photo_info, config);
    println!("  dest_dir: {:?}", dest_dir);

    println!("----------");

    //let dest_path = get_photo_destination_directory(&photo_info, config)?;
    // println!("{:?}", dest_path);

    Ok(())
}

fn is_photo_file(path: &Path) -> bool {
    if path.exists() && path.is_file() {
        if let Some(ext) = path.extension() {
            if let Some(str_ext) = ext.to_str() {
                match str_ext.to_lowercase().as_str() {
                    "jpg" => return true,
                    "jpeg" => return true,
                    "tiff" => return true,
                    _ => return false,
                }
            }
        }
    }

    false
}

fn get_photo_destination_directory(
    photo_info: &PhotoInfo,
    config: &Config,
) -> anyhow::Result<PathBuf> {
    let date_time = &photo_info.photo_date_time;
    let extension = photo_info.path.extension().unwrap();

    let year = date_time.format("%Y").to_string();
    let month = date_time.format("%m").to_string();
    let file_name = date_time.format("%Y-%m-%d %H.%M.%S.%f").to_string();

    let mut file_path = PathBuf::from(&config.directories.organized);
    file_path.push(PathBuf::from(year).as_path());
    file_path.push(PathBuf::from(month).as_path());
    file_path.push(PathBuf::from(file_name).as_path());
    file_path.set_extension(PathBuf::from(extension));

    return Ok(file_path);
}

// ---------------------------------------- Main  ---------------------------------------- //

// fn list_some_files() -> io::Result<()> {
//     let mut entries = fs::read_dir("C:\\GitHub\\Photiso\\v2")?
//         .map(|res| res.map(|e| e.path()))
//         .collect::<Result<Vec<_>, io::Error>>()?;
//     entries.sort();

//     for entry in entries.into_iter(){
//         println!("{:?}", entry);
//     }
//     Ok(())
// }

// props: unorganizedDir, organizedDir, duplicatesDir,
// onShouldContinue, onStartedDir, onFinishedDir, onStartedFile, onFinishedFile
// onNoOp, onSkipped, onMoved, onDuplicateMoved, onError
// photo info: fileName, takenDateTime, createdDateTime, modifiedDateTime, fileHash, length, bestDateTime

// fn organize() {}
// fn organize_directory() {}
// fn organize_file() {}
// fn get_photo_info() {}
// fn move_photo() {}
// fn is_photo {}
// fn is_same_photo() {}
// fn get_photo_destination_directory() {}
// fn get_photo_destination_filename() {}

/*

organize()
    verify unorganized directory exists
    organize_directory


organize_directory(dir)
    if dir is duplicates directory return
    for each file in dir
        organize_file(file)
    for each child dir in dir
        organize_directory(child)
*/
