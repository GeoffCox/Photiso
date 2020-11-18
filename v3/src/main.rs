mod photo_info;

use crate::photo_info::*;
use anyhow::*;
use serde::Deserialize;
use std::{fs, fs::File, io, io::Read, path::Path, path::PathBuf};

// ---------------------------------------- Config ---------------------------------------- //

#[derive(Deserialize, Debug)]
struct Config {
    directories: ConfigDirectories,
}

#[derive(Deserialize, Debug)]
struct ConfigDirectories {
    unorganized: String,
    organized: String,
    duplicates: String,
}

fn load_config() -> io::Result<String> {
    let path = Path::new("./Photiso.toml");

    let mut file = File::open(&path)?;

    let mut s = String::new();
    file.read_to_string(&mut s)?;

    Ok(s)
}

// ---------------------------------------- exif helpers ---------------------------------------- //

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

// ---------------------------------------- Directories ---------------------------------------- //

fn get_photo_destination_directory(
    photo_info: &PhotoInfo,
    config: &Config,
) -> anyhow::Result<PathBuf> {
    println!("{:?}", photo_info.photo_date_time);
    let file_path = PathBuf::from(&config.directories.unorganized);
    //file_path.push(photo_info.photo_date_time.year().to_string());
    println!("{:?}", file_path);
    return Ok(file_path);
}

fn organize_photo_file(file_path: &Path, config: &Config) -> anyhow::Result<()> {
    //print_all_exif(file_path)?;

    let photo_info = get_photo_info(file_path)?;
    print!("  photo_info: {:?}", photo_info);
    println!();
    println!("----------");

    //let dest_path = get_photo_destination_directory(&photo_info, config)?;
    // println!("{:?}", dest_path);

    Ok(())
}

fn organize_directory(dir_path: &Path, config: &Config) -> anyhow::Result<()> {
    // file entries immediately in this directory
    let mut entries = fs::read_dir(&dir_path)?
        .map(|res| res.map(|e| e.path()))
        .collect::<Result<Vec<_>, io::Error>>()?;
    entries.sort();

    // photos in this directory
    for e in entries.iter().filter(|e| is_photo_file(&e)) {
        organize_photo_file(&e, config)?;
    }

    Ok(())
}

// ---------------------------------------- Main  ---------------------------------------- //

fn main() -> anyhow::Result<()> {
    println!("Hello Photiso");

    let config_text = load_config()?;
    let config: Config = toml::from_str(&config_text).unwrap();

    // print!("{:?}", config);
    // println!();

    let unorganized_dir = Path::new(&config.directories.unorganized);
    // println!("Unorganized: {:?}", unorganized_dir);
    organize_directory(&unorganized_dir, &config)?;

    // let  file_path = Path::new("./bikelane.jpg");
    // let photo_info = get_photo_info(&file_path)?;
    // print!("{:?}", photo_info);
    // println!();

    // println!("unorganized: {}", config.directories.unorganized);
    // println!("organized: {}", config.directories.organized);
    // println!("duplicates: {}", config.directories.duplicates);

    Ok(())
}

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
