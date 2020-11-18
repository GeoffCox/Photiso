pub use anyhow::*;
use chrono::TimeZone;
use chrono::Utc;
use exif::{In, Tag};
use std::{fs, fs::File, path::Path, path::PathBuf};

#[derive(Debug)]
pub struct PhotoInfo {
    pub path: PathBuf,
    pub photo_date_time: chrono::DateTime<chrono::Utc>,
    pub length: u64,
    // created_date_time: Option<String>,
    // modified_date_time: Option<String>,
    // file_hash: Option<String>,
    // length: Option<u64>
}

pub fn get_photo_info(file_path: &Path) -> anyhow::Result<PhotoInfo> {
    let file = File::open(&file_path)?;

    println!("file: {:?}", file_path);

    let metadata = fs::metadata(file_path)?;

    // file created
    let created_date_time = convert_system_time_to_chrono_date_time(&metadata.created()?)?;
    println!("  created:   {:?}", created_date_time);

    // file modified
    let modified_date_time = convert_system_time_to_chrono_date_time(&metadata.modified()?)?;
    println!("  modified:  {:?}", modified_date_time);

    let mut photo_date_time: chrono::DateTime<Utc> = created_date_time;

    if modified_date_time < created_date_time {
        photo_date_time = modified_date_time;
    }

    let mut bufreader = std::io::BufReader::new(&file);
    let exifreader = exif::Reader::new();
    if let Ok(exif) = exifreader.read_from_container(&mut bufreader) {
        // exif DateTime - good
        if let Some(date_time) =
            get_exif_chrono_date_time_pair(&exif, Tag::DateTime, Tag::SubSecTime)
        {
            photo_date_time = date_time;
            println!("  exif date:           {:?}", date_time);
        }

        // exif DateTimeDigitized - better
        if let Some(date_time) =
            get_exif_chrono_date_time_pair(&exif, Tag::DateTimeDigitized, Tag::SubSecTimeDigitized)
        {
            photo_date_time = date_time;
            println!("  exif digitized: {:?}", date_time);
        }

        // exif DateTimeOriginal - best
        if let Some(date_time) =
            get_exif_chrono_date_time_pair(&exif, Tag::DateTimeOriginal, Tag::SubSecTimeOriginal)
        {
            photo_date_time = date_time;
            println!("  exif original:  {:?}", date_time);
        }
    }

    let photo_info = PhotoInfo {
        path: PathBuf::from(&file_path),
        photo_date_time: photo_date_time,
        length: metadata.len(),
    };

    return Ok(photo_info);
}

fn convert_exif_to_chrono_date_time(
    exif_date_time: &exif::DateTime,
) -> chrono::DateTime<chrono::Utc> {
    let date = chrono::Utc.ymd(
        exif_date_time.year as i32,
        exif_date_time.month as u32,
        exif_date_time.day as u32,
    );

    let date_time = date.and_hms_nano(
        exif_date_time.hour as u32,
        exif_date_time.minute as u32,
        exif_date_time.second as u32,
        exif_date_time.nanosecond.unwrap_or(0),
    );

    match exif_date_time.offset {
        Some(offset_minutes) => date_time + chrono::Duration::minutes(offset_minutes as i64),
        None => date_time,
    }
}

fn convert_exif_value_to_date_time(value: &exif::Value) -> Option<exif::DateTime> {
    if let exif::Value::Ascii(lines) = value {
        if lines.len() > 0 {
            if let Ok(date_time) = exif::DateTime::from_ascii(&lines[0]) {
                return Some(date_time);
            }
        }
    }

    None
}

fn convert_exif_value_to_u32(value: &exif::Value) -> Option<u32> {
    if let exif::Value::Ascii(lines) = value {
        if lines.len() > 0 {
            if let Ok(line) = std::str::from_utf8(&lines[0]) {
                if let Ok(number) = line.parse() {
                    return Some(number);
                }
            }
        }
    }

    None
}

#[allow(dead_code)]
fn convert_exif_value_to_string(value: &exif::Value) -> Option<String> {
    if let exif::Value::Ascii(lines) = value {
        if lines.len() > 0 {
            if let Ok(text) = std::str::from_utf8(&lines[0]) {
                return Some(text.to_string());
            }
        }
    }

    None
}

fn convert_system_time_to_chrono_date_time(
    value: &std::time::SystemTime,
) -> anyhow::Result<chrono::DateTime<Utc>> {
    let created_duration = value.duration_since(std::time::SystemTime::UNIX_EPOCH)?;
    Ok(chrono::Utc.timestamp(
        created_duration.as_secs() as i64,
        created_duration.subsec_nanos(),
    ))
}

fn get_exif_chrono_date_time(exif: &exif::Exif, tag: Tag) -> Option<chrono::DateTime<Utc>> {
    if let Some(field) = exif.get_field(tag, In::PRIMARY) {
        if let Some(exif_date_time) = convert_exif_value_to_date_time(&field.value) {
            let chrono_date_time = convert_exif_to_chrono_date_time(&exif_date_time);
            return Some(chrono_date_time);
        }
    }

    None
}

fn get_exif_field_u32(exif: &exif::Exif, tag: Tag) -> Option<u32> {
    if let Some(field) = exif.get_field(tag, In::PRIMARY) {
        return convert_exif_value_to_u32(&field.value);
    }

    None
}

#[allow(dead_code)]
fn get_exif_field_string(exif: &exif::Exif, tag: Tag) -> Option<String> {
    if let Some(field) = exif.get_field(tag, In::PRIMARY) {
        return convert_exif_value_to_string(&field.value);
    }

    None
}

fn get_exif_chrono_date_time_pair(
    exif: &exif::Exif,
    date_tag: Tag,
    sub_sec_tag: Tag,
) -> Option<chrono::DateTime<Utc>> {
    if let Some(date_time) = get_exif_chrono_date_time(exif, date_tag) {
        if let Some(sub_sec) = get_exif_field_u32(exif, sub_sec_tag) {
            return Some(date_time + chrono::Duration::milliseconds(sub_sec as i64));
        }

        return Some(date_time);
    }

    None
}

#[allow(dead_code)]
fn print_all_exif(file_path: &Path) -> anyhow::Result<()> {
    let file = File::open(&file_path)?;
    let mut buf_reader = std::io::BufReader::new(&file);
    let exif_reader = exif::Reader::new();
    let exif = exif_reader.read_from_container(&mut buf_reader)?;
    for f in exif.fields() {
        println!(
            "{} {} {}",
            f.tag,
            f.ifd_num,
            f.display_value().with_unit(&exif)
        );
    }

    Ok(())
}
