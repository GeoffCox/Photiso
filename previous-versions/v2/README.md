# Photiso

Photiso is a photo organization command line tool. It organizes your photos into directories by year and month. It names your photos by year-month-day hour-minute-second-fractionsOfSeconds.

## WARNING

You should always back up your photos before running Photiso. While extra care has been taken to ensure Photiso is non-destructive, there is always the chance that something could go horriblly wrong.


- Photiso was written to never delete files nor directories.
- Photiso should never copy over an existing file.

## Configuration

Photiso's configuration file lets you specify 3 directories:
- unorganized: The directory containing the files you want Photiso to inspect, move, and name.
- organized: This is the directory where you want your photos to be move to to organize them.
- duplicates: This is the directory where you want duplicate photos to be moved to.

The unorganized and organized directories can be the same directory if you want to organize them in place.

## Special Situations

- Photiso looks at the EXIF data stored with the file that was written there by your digital cameral or phone. If the EXIF data is missing for a file, then Photiso falls back to using the created and modified dates of the file.
- If Photiso encounters a duplicate photo (exact same file contents), that photo gets placed into the duplicates directory.
- If Photiso encounters a file at the same location, then it will append a 3-digit number to the end of the file being moved to avoid the conflict.

## Technology

Photiso 2.0 (this version)
- Written in Rust.
- Is a command line application.
- Can be compiled to run on any of the operating systems supported by Rust (e.g. Windows, Mac, Unix).
- Uses the kamadak-exif crate which is super-fast at extracting EXIF date.
- Has a configuration file in TOML format.

Photiso 1.0
- Written in .NET and Windows Presentation Foundation (WPF)
- Is a windows client application.
- While pretty, this version was somewhat slow for large number of files.
- Could only run on Windows
- Lacks fractional second precision when inspecting the EXIF data.



