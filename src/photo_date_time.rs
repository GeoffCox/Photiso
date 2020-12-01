use chrono::TimeZone;
use exif::{In, Tag};
use std::{fs, fs::File, path::Path};

#[doc(hidden)]
pub use anyhow::*;

#[doc(hidden)]
pub use chrono::{DateTime, Utc};

/// Date-time information for a photo
pub struct PhotoDateTimeInfo {
    /// When the file was created
    created: chrono::DateTime<Utc>,
    /// When the file was last modified
    modified: chrono::DateTime<Utc>,
    /// When the photo was taken (least precise)
    exif_base: Option<chrono::DateTime<Utc>>,
    /// When the photo was originally taken (most precise)
    exif_original: Option<chrono::DateTime<Utc>>,
    /// When the photo was digitized to camera memory
    exif_digitized: Option<chrono::DateTime<Utc>>,
}

impl PhotoDateTimeInfo {
    /// Finds the date-time that is best to use as the taken date-time.
    /// This prefers exif original, digitized, and base (in order).
    /// This falls back to the file's earliest created or modified date-time.
    pub fn best(&self) -> chrono::DateTime<Utc> {
        if let Some(exif_original) = self.exif_original {
            return exif_original.clone();
        }

        if let Some(exif_digitized) = self.exif_digitized {
            return exif_digitized.clone();
        }

        if let Some(exif_base) = self.exif_base {
            return exif_base.clone();
        }

        if self.modified < self.created {
            return self.created.clone();
        }

        return self.modified.clone();
    }

    /// Loads the photo date-times for a file based on metadata and EXIF information.
    pub fn load(file_path: &Path) -> anyhow::Result<PhotoDateTimeInfo> {
        let file = File::open(&file_path)?;

        let metadata = fs::metadata(file_path)?;
        let created = convert_system_time_to_chrono_date_time(&metadata.created()?)?;
        let modified = convert_system_time_to_chrono_date_time(&metadata.modified()?)?;

        let mut exif_base: Option<DateTime<Utc>> = None;
        let mut exif_original: Option<DateTime<Utc>> = None;
        let mut exif_digitized: Option<DateTime<Utc>> = None;

        let mut bufreader = std::io::BufReader::new(&file);
        let exifreader = exif::Reader::new();
        if let Ok(exif) = exifreader.read_from_container(&mut bufreader) {
            if let Some(date_time) =
                get_exif_chrono_date_time_pair(&exif, Tag::DateTime, Tag::SubSecTime)
            {
                exif_base = Some(date_time);
            }

            if let Some(date_time) = get_exif_chrono_date_time_pair(
                &exif,
                Tag::DateTimeOriginal,
                Tag::SubSecTimeOriginal,
            ) {
                exif_original = Some(date_time);
            }

            if let Some(date_time) = get_exif_chrono_date_time_pair(
                &exif,
                Tag::DateTimeDigitized,
                Tag::SubSecTimeDigitized,
            ) {
                exif_digitized = Some(date_time);
            }
        }

        return Ok(PhotoDateTimeInfo {
            created,
            modified,
            exif_base,
            exif_original,
            exif_digitized,
        });
    }
}

// -------------------- std::time::SystemTime -> chrono::DateTime conversion -------------------- //

#[doc(hidden)]
fn convert_system_time_to_chrono_date_time(
    value: &std::time::SystemTime,
) -> anyhow::Result<chrono::DateTime<Utc>> {
    let created_duration = value.duration_since(std::time::SystemTime::UNIX_EPOCH)?;
    Ok(Utc.timestamp(
        created_duration.as_secs() as i64,
        created_duration.subsec_nanos(),
    ))
}

// -------------------- EXIF -> chrono::DateTime conversion -------------------- //

#[doc(hidden)]
fn days_in_month(year: i32, month: u32) -> i64 {
    if month == 12 {
        chrono::NaiveDate::from_ymd(year + 1, 1, 1)
    } else {
        chrono::NaiveDate::from_ymd(year, month + 1, 1)
    }
    .signed_duration_since(chrono::NaiveDate::from_ymd(year, month, 1))
    .num_days()
}

// Unfortunately, exif::DateTime can have components beyond the bounds of a valid date and time
// (e.g. 400 minutes, 80 seconds, etc.)
#[doc(hidden)]
fn ensure_valid_exif_date_time(exif_date_time: &exif::DateTime) -> exif::DateTime {
    let mut year = exif_date_time.year;
    let mut month = exif_date_time.month;
    let mut day = exif_date_time.day;
    let mut hour = exif_date_time.hour;
    let mut minute = exif_date_time.minute;
    let mut second = exif_date_time.second;
    let mut nanosecond = exif_date_time.nanosecond;

    if let Some(nano) = exif_date_time.nanosecond {
        second += (nano / 1000000000) as u8;
        nanosecond = Some(nano % 1000000000);
    }

    minute += second / 60;
    second = second % 60;

    hour += minute / 60;
    minute = minute % 60;

    day += hour / 24;
    hour = hour % 24;

    let mut cur_days_in_month = days_in_month(year as i32, month as u32) as u8;
    while day > cur_days_in_month {
        day -= cur_days_in_month;
        month += 1;

        if month > 12 {
            month = 1;
            year += 1;
        }

        cur_days_in_month = days_in_month(year as i32, month as u32) as u8;
    }

    year += (month / 12) as u16;
    month = month % 12;

    return exif::DateTime {
        year,
        month,
        day,
        hour,
        minute,
        second,
        nanosecond,
        offset: exif_date_time.offset,
    };
}

#[doc(hidden)]
fn convert_exif_to_chrono_date_time(exif_date_time: &exif::DateTime) -> chrono::DateTime<Utc> {
    let exif_date_time = ensure_valid_exif_date_time(exif_date_time);

    let date = Utc.ymd(
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

#[doc(hidden)]
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

#[doc(hidden)]
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

#[doc(hidden)]
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

// -------------------- EXIF helpers -------------------- //

#[doc(hidden)]
fn get_exif_chrono_date_time(exif: &exif::Exif, tag: Tag) -> Option<chrono::DateTime<Utc>> {
    if let Some(field) = exif.get_field(tag, In::PRIMARY) {
        if let Some(exif_date_time) = convert_exif_value_to_date_time(&field.value) {
            let chrono_date_time = convert_exif_to_chrono_date_time(&exif_date_time);
            return Some(chrono_date_time);
        }
    }

    None
}

#[doc(hidden)]
fn get_exif_field_u32(exif: &exif::Exif, tag: Tag) -> Option<u32> {
    if let Some(field) = exif.get_field(tag, In::PRIMARY) {
        return convert_exif_value_to_u32(&field.value);
    }

    None
}

#[doc(hidden)]
#[allow(dead_code)]
fn get_exif_field_string(exif: &exif::Exif, tag: Tag) -> Option<String> {
    if let Some(field) = exif.get_field(tag, In::PRIMARY) {
        return convert_exif_value_to_string(&field.value);
    }

    None
}

#[doc(hidden)]
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

#[doc(hidden)]
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
