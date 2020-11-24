mod config;
mod file_hash;
mod photo_date_time;
mod photo_organizer;

use crate::config::*;
use crate::photo_organizer::*;
use std::path::Path;

fn main() -> anyhow::Result<()> {
    let canonical_path = Path::new(
        "\\\\?\\C:\\GitHub\\Photiso\\v3\\test_files\\unorganized\\foo\\bar\\baz\\NotAPhoto.txt",
    );
    let canonical_base = Path::new("\\\\?\\C:\\GitHub\\Photiso\\v3\\test_files\\unorganized");
    let lay_base = Path::new(".\\unorganized");

    let target = canonical_path.to_str().unwrap();
    let remove = canonical_base.to_str().unwrap();

    let lay_path = target.strip_prefix(remove).unwrap();
    println!("lay_path {:?}", lay_path);

    let lay_result = lay_base.join(lay_path);
    println!("lay_result {:?}", lay_result);

    let path_stripped = canonical_path.strip_prefix(canonical_base).unwrap();
    println!("path_stripped {:?}", path_stripped);

    println!("----------------------------------------");
    println!("Photiso");

    let config: Config = load_config()?;

    println!(
        "unorganized directory: {:?}",
        config.directories.unorganized
    );
    println!("organized directory: {:?}", config.directories.organized);
    println!("duplicates directory: {:?}", config.directories.duplicates);

    println!("----------------------------------------");

    let on_event = create_on_photiso_event(Config {
        directories: ConfigDirectories {
            unorganized: config.directories.unorganized.clone(),
            organized: config.directories.organized.clone(),
            duplicates: config.directories.duplicates.clone(),
        },
        options: ConfigOptions {
            output: String::from("normal"),
        },
    });

    photo_organizer::organize(
        &config.directories.unorganized,
        &config.directories.organized,
        &config.directories.duplicates,
        on_event,
    )?;

    println!("----------------------------------------");

    Ok(())
}

fn create_on_photiso_event(config: Config) -> Box<dyn Fn(PhotisoEvent) -> bool> {
    Box::new(move |event| -> bool {
        on_photiso_event(&config, event);
        true
    })
}

fn try_trim_prefix<P>(path: &Path, _base: P) -> &Path
where
    P: AsRef<Path>,
{
    path
    // match path.strip_prefix(base) {
    //     Ok(new_path) => new_path.as_ref(),
    //     Err(e) => {
    //         println!("trim_prefix error. {:?}", e.to_string());
    //         return path.as_ref();
    //     }
    // }
}

fn on_photiso_event(config: &Config, event: PhotisoEvent) {
    match event {
        PhotisoEvent::DirStarted { dir } => {
            let trim_dir = try_trim_prefix(dir, &config.directories.unorganized);
            println!("Dir: {:?}", trim_dir);
        }
        PhotisoEvent::FileStarted { file } => {
            let trim_file = try_trim_prefix(file, &config.directories.unorganized);
            println!("  File: {:?}", trim_file);
        }
        PhotisoEvent::FileMoved { from, to } => {
            let trim_from = try_trim_prefix(from, &config.directories.unorganized);
            let trim_to = try_trim_prefix(to, &config.directories.organized);
            println!("    Moved: {:?} -> {:?}", trim_from, trim_to);
        }
        PhotisoEvent::DuplicateFileMoved { from, to } => {
            let trim_from = try_trim_prefix(from, &config.directories.unorganized);
            let trim_to = try_trim_prefix(to, &config.directories.duplicates);
            println!("    Moved: {:?} -> {:?}", trim_from, trim_to);
        }
        PhotisoEvent::FileNoOp { file } => {
            let trim_file = try_trim_prefix(file, &config.directories.unorganized);
            println!("    No-op: {:?}", trim_file);
        }
        PhotisoEvent::FileSkipped { file, reason } => {
            let trim_file = try_trim_prefix(file, &config.directories.unorganized);
            println!("    Skipped - {}: {:?}", reason, trim_file);
        }

        _ => {}
    }
}

fn on_photiso_event_2(config: &Config, event: PhotisoEvent) {
    match event {
        PhotisoEvent::FileMoved { from, to } => {
            print!(".");
        }
        PhotisoEvent::DuplicateFileMoved { from, to } => {
            print!("D");
        }
        PhotisoEvent::FileNoOp { file } => {
            print!("-");
        }
        PhotisoEvent::FileSkipped { file, reason } => {
            print!("S");
        }
        PhotisoEvent::FileError { file, error } => {
            print!("E");
        }

        _ => {}
    }
}
