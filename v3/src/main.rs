use chrono::TimeZone;
use std::{ffi::OsStr, fs, io, path::PathBuf, path::Path};
use std::fs::File;
use std::io::prelude::*;
use serde::*;
use std::fmt;
use exif::{In, Tag};


// ---------------------------------------- PhotisoError ---------------------------------------- //

#[derive(Debug)]
enum PhotisoError {
    General(&'static str),
    Exif(exif::Error),
    Io(io::Error),
    Parse(chrono::ParseError),
    SystemTime(std::time::SystemTimeError)
}

impl From<exif::Error> for PhotisoError {
    fn from(err: exif::Error) -> PhotisoError {
        PhotisoError::Exif(err)
    }
}

impl From<io::Error> for PhotisoError {
    fn from(err: io::Error) -> PhotisoError {
        PhotisoError::Io(err)
    }
}

impl From<chrono::ParseError> for PhotisoError {
    fn from(err: chrono::ParseError) -> PhotisoError {
        PhotisoError::Parse(err)
    }
}

impl From<std::time::SystemTimeError> for PhotisoError {
    fn from(err: std::time::SystemTimeError) -> PhotisoError {
        PhotisoError::SystemTime(err)
    }
}


impl std::error::Error for PhotisoError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match *self {
            PhotisoError::General(_) => None,
            PhotisoError::Io(ref err) => Some(err),
            PhotisoError::Exif(ref err) => Some(err),
            PhotisoError::Parse(ref err) => Some(err),
            PhotisoError::SystemTime(ref err) => Some(err),
        }
    }
}

impl fmt::Display for PhotisoError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            PhotisoError::General(ref err) => write!(f, "Error: {}", err),
            PhotisoError::Exif(ref err) => write!(f, "Exif error: {}", err),
            PhotisoError::Io(ref err) => write!(f, "IO error: {}", err),
            PhotisoError::Parse(ref err) => write!(f, "Parse error: {}", err),
            PhotisoError::SystemTime(ref err) => write!(f, "Time error: {}", err),
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
    taken_date_time: chrono::DateTime<chrono::Utc>,
    length: u64
    // created_date_time: Option<String>,
    // modified_date_time: Option<String>,
    // file_hash: Option<String>,
    // length: Option<u64>,
}

fn get_exif_field_string_value(exif: &exif::Exif, tag: Tag) -> Result<String, PhotisoError> {
    let field = exif.get_field(tag, In::PRIMARY);

    match field {
        Some(field_value) => return Ok(field_value.display_value().with_unit(exif).to_string()),
        None => return Err(PhotisoError::General("Exif field not found"))
    }
}

// DateTime, DateTimeOriginal, DateTimeDigitized
// OffsetTime, OffsetTimeOriginal, OffsetTimeDigitized
// SubSecTime, SubSecTimeOriginal, SubSecTimeDigitized
// GPSDateStamp,
fn get_photo_info(file_path: &Path) -> Result<PhotoInfo, PhotisoError> {
    let file = File::open(&file_path)?;

    let mut bufreader = std::io::BufReader::new(&file);
    let exifreader = exif::Reader::new();
    let exif = exifreader.read_from_container(&mut bufreader)?;

    let metadata = fs::metadata(file_path)?;
    println!("{:?}", metadata.file_type());
    println!("{:?}", metadata.created()?);
    println!("{:?}", metadata.modified()?);

    let created_duration = metadata.created()?.duration_since(std::time::SystemTime::UNIX_EPOCH)?;
    let mut created_date_time = chrono::Utc.timestamp(created_duration.as_secs() as i64, created_duration.subsec_nanos());
    println!("created_date_time: {:?}", created_date_time);

    let date_time_original = get_exif_field_string_value(&exif, Tag::DateTimeOriginal)?;
    let subsec_time_original = get_exif_field_string_value(&exif, Tag::SubSecTimeOriginal)?;

    println!("date_time_original: {:?}", date_time_original);
    println!("subsec_time_original {:?}", subsec_time_original);

    let photo_info = PhotoInfo {
        path: PathBuf::from(&file_path),
        taken_date_time: chrono::Utc.datetime_from_str(&date_time_original, "%Y-%m-%d %H:%M:%S")?,
        length: metadata.len()
    };

    return Ok(photo_info);
}

fn print_all_exif(file_path: &Path) -> Result<(),PhotisoError> {
    let file = File::open(&file_path)?;
    let mut buf_reader = std::io::BufReader::new(&file);
    let exif_reader = exif::Reader::new();
    let exif = exif_reader.read_from_container(&mut buf_reader)?;
    for f in exif.fields() {
        println!("{} {} {}",
                 f.tag, f.ifd_num, f.display_value().with_unit(&exif));
    }

    Ok(())
}

fn is_photo_file(path: &Path) -> bool {

    let photo_extensions = [OsStr::new("jpg"), OsStr::new("jpeg"), OsStr::new("tiff")];

    match path.extension() {
        Some(extension) => path.exists() && path.is_file() && photo_extensions.contains(&extension),
        None => false
    }
}

// ---------------------------------------- Directories ---------------------------------------- //

fn get_photo_destination_directory(photo_info: &PhotoInfo, config: &Config) -> Result<PathBuf,PhotisoError> {

    println!("{:?}", photo_info.taken_date_time);
    let mut file_path = PathBuf::from(&config.directories.unorganized);
    //file_path.push(photo_info.taken_date_time.year().to_string());
    println!("{:?}", file_path);
    return Ok(file_path);
}

fn organize_photo_file(file_path: &Path, config: &Config) -> Result<(),PhotisoError> {

    print_all_exif(file_path)?;

    let photo_info = get_photo_info(file_path)?;
    print!("{:?}", photo_info);
    println!();

    println!("Here");
    let dest_path = get_photo_destination_directory(&photo_info, config)?;
    println!("{:?}", dest_path);

    Ok(())
}

fn organize_directory(dir_path: &Path, config: &Config) -> Result<(),PhotisoError> {

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

fn main() -> Result<(), PhotisoError> {
    println!("Hello Photiso");

    let config_text = load_config()?;
    let config: Config = toml::from_str(&config_text).unwrap();

    print!("{:?}", config);
    println!();

    let unorganized_dir = Path::new(&config.directories.unorganized);
    println!("Unorganized: {:?}", unorganized_dir);
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

