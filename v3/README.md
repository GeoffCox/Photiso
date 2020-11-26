# Photiso

Photiso is a photo organization command line tool.

It organizes your photos into directories by year and month. It names your photos by year-month-day hour-minute-second-fractions. Photiso looks at the EXIF data stored with the file that was written there by your digital cameral or phone. If the EXIF data is missing for a file, then Photiso falls back to using the created and modified dates of the file.

If Photiso encounters a duplicate photo (exact same file contents), that photo gets placed into the duplicates directory. Photiso never deletes files nor directories. Photiso will never copy over an existing file.

Photiso's configuration file lets you specify 3 directories:
- unorganized: The directory containing the files you want Photiso to inspect, move, and name.
- organized: This is the directory where you want your photos to be move to to organize them.
- duplicates: This is the directory where you want duplicate photos to be moved to.

The unorganized and organized directories can be the same directory if you want to organize them in place.

## Technology

Photiso 1.0 was orignally written in .NET and was a windows client application. It was written using Windows Presentation Foundation (WPF). While pretty, this version was somewhat slow for large number of files, could only run on Windows, and lacked fractional second precision when inspecting the EXIF data.

Photiso 2.0 (this version) was written in Rust. It is a command line application.  It can be compiled to run on any of the operating systems supported by Rust (e.g. Windows, Mac, Unix).

