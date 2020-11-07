use std::{path::PathBuf, io};
//use std::fs;
use std::fs::File;
use std::io::prelude::*;
use std::path::Path;
use serde::*;
use std::fmt;
use exif::{Error, Field, Tag};
use exif::In;

// ---------------------------------------- PhotisoError ---------------------------------------- //

#[derive(Debug)]
enum PhotisoError {
    Exif(Error),
    Io(io::Error),
}

impl From<Error> for PhotisoError {
    fn from(err: Error) -> PhotisoError {
        PhotisoError::Exif(err)
    }
}

impl From<io::Error> for PhotisoError {
    fn from(err: io::Error) -> PhotisoError {
        PhotisoError::Io(err)
    }
}

impl fmt::Display for PhotisoError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            PhotisoError::Exif(ref err) => write!(f, "Exif error: {}", err),
            PhotisoError::Io(ref err) => write!(f, "IO error: {}", err),
        }
    }
}

// ---------------------------------------- Config ---------------------------------------- //

#[derive(Deserialize)]
#[derive(Debug)]
struct Config {
    directories: ConfigDirectories,

}

#[derive(Deserialize)]
#[derive(Debug)]
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

// ---------------------------------------- PhotoInfo ---------------------------------------- //

#[derive(Debug)]
struct PhotoInfo {
    path : PathBuf,
    taken_date_time: String,
    // created_date_time: Option<String>,
    // modified_date_time: Option<String>,
    // file_hash: Option<String>,
    // length: Option<u64>,
}

fn get_photo_info(file_path: &Path) -> Result<PhotoInfo, PhotisoError> {
    let file = File::open(&file_path)?;
    let mut bufreader = std::io::BufReader::new(&file);
    let exifreader = exif::Reader::new();
    let exif = exifreader.read_from_container(&mut bufreader)?;

    let date_time_original_field = exif.get_field(Tag::DateTimeOriginal, In::PRIMARY);

    let mut taken_date_time =String::new();
    if let Some(date_time_original_value) =  date_time_original_field {
        taken_date_time = date_time_original_value.display_value().to_string();
    }

    let photoInfo = PhotoInfo {
        path: PathBuf::from(&file_path),
        taken_date_time: taken_date_time
    };

    return Ok(photoInfo);
}

// ---------------------------------------- Main  ---------------------------------------- //

fn main() -> Result<(), PhotisoError> {
    println!("Hello world");

    let s = load_config()?;

    //println!("{}",s);

    let config: Config = toml::from_str(&s).unwrap();

    read_exif()?;

    // println!("unorganized: {}", config.directories.unorganized);
    // println!("organized: {}", config.directories.organized);
    // println!("duplicates: {}", config.directories.duplicates);
    print!("{:?}", config);
    Ok(())
}



fn read_exif() -> Result<(), PhotisoError> {
    let  path = Path::new("./bikelane.jpg");
    let file = File::open(&path)?;
    let mut bufreader = std::io::BufReader::new(&file);
    let exifreader = exif::Reader::new();
    let exif = exifreader.read_from_container(&mut bufreader)?;
    for f in exif.fields() {
        println!("{} {} {}",
                 f.tag, f.ifd_num, f.display_value().with_unit(&exif));
    }

    let date_time_original_field = exif.get_field(Tag::DateTimeOriginal, In::PRIMARY);

    let mut taken_date_time =String::new();
    if let Some(date_time_original_value) =  date_time_original_field {
        taken_date_time = date_time_original_value.display_value().to_string();
    }

    let photoInfo = PhotoInfo {
        path: PathBuf::from(&path),
        taken_date_time: taken_date_time
    };

    print!("{:?}", photoInfo);

    // let date_time = exif.get_field(Tag::DateTime, In::PRIMARY)
    //     .ok_or(None::<Field>)?;
    // println!("{}", date_time.display_value());

    // let date_time_original = exif.get_field(Tag::DateTimeOriginal, In::PRIMARY)
    //     .ok_or(Error::NotFound("tests/exif.jpg must have DateTimeOriginal"))?;
    // println!("{}", date_time_original.display_value());

    // let date_time_digitized = exif.get_field(Tag::DateTimeDigitized, In::PRIMARY)
    //     .ok_or(Error::NotFound("tests/exif.jpg must have DateTimeDigitized"))?;
    // println!("{}", date_time_digitized.display_value());

    // OffsetTime, OffsetTimeOriginal, OffsetTimeDigitized
    // SubSecTime, SubSecTimeOriginal, SubSecTimeDigitized
    // GPSDateStamp,

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

