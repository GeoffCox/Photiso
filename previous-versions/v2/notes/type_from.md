# How to provide type conversion from a type in another library

```Rust
struct PhotisoDateTime(chrono::DateTime<chrono::Utc>);

impl From<exif::DateTime> for PhotisoDateTime {
    fn from(exif_date_time: exif::DateTime) -> PhotisoDateTime {

        let date = chrono::Utc.ymd(
            exif_date_time.year as i32,
            exif_date_time.month as u32,
            exif_date_time.day as u32);

        let date_time = date.and_hms_nano(
            exif_date_time.hour as u32,
            exif_date_time.minute as u32,
            exif_date_time.second as u32,
            exif_date_time.nanosecond.unwrap_or(0)
        );

        match exif_date_time.offset {
            Some(offset_minutes) => PhotisoDateTime(date_time + chrono::Duration::minutes(offset_minutes as i64)),
            None => PhotisoDateTime(date_time)
        }
    }
}

impl fmt::Debug for PhotisoDateTime {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!("{}", self.0))
    }
}
```
