mod config;
mod file_hash;
mod photo_date_time;
mod photo_organizer;

use crate::config::*;
use crate::photo_organizer::*;
use std::path::Path;

fn main() -> anyhow::Result<()> {
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

    let on_event = returns_closure(Config {
        directories: ConfigDirectories {
            unorganized: config.directories.unorganized.clone(),
            organized: config.directories.organized.clone(),
            duplicates: config.directories.duplicates.clone(),
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

fn returns_closure(config: Config) -> Box<dyn Fn(PhotisoEvent) -> bool> {
    Box::new(move |event| -> bool {
        on_photiso_event(&config, event);
        true
    })
}

fn try_trim_prefix<P>(path: &Path, base: P) -> &Path
where
    P: AsRef<Path>,
{
    match path.strip_prefix(base) {
        Ok(new_path) => new_path.as_ref(),
        Err(e) => {
            println!("trim_prefix error. {:?}", e.to_string());
            return path.as_ref();
        }
    }
}

fn on_photiso_event(config: &Config, event: PhotisoEvent) {
    match event {
        PhotisoEvent::DirStarted { dir } => {
            let trim_dir = try_trim_prefix(dir, &config.directories.unorganized);
            println!(
                "Dir: (unorganized){}{:?}",
                std::path::MAIN_SEPARATOR,
                trim_dir
            );
        }
        PhotisoEvent::FileStarted { file } => {
            let trim_file = try_trim_prefix(file, &config.directories.unorganized);
            println!(
                "  File: (unorganized){}{:?}",
                std::path::MAIN_SEPARATOR,
                trim_file
            );
        }
        PhotisoEvent::FileMoved { from, to } => {
            let trim_from = try_trim_prefix(from, &config.directories.unorganized);
            let trim_to = try_trim_prefix(to, &config.directories.organized);
            println!(
                "    Moved: (unorganized){}{:?} -> (organized){}{:?}",
                std::path::MAIN_SEPARATOR,
                trim_from,
                std::path::MAIN_SEPARATOR,
                trim_to
            );
        }
        PhotisoEvent::DuplicateFileMoved { from, to } => {
            let trim_from = try_trim_prefix(from, &config.directories.unorganized);
            let trim_to = try_trim_prefix(to, &config.directories.duplicates);
            println!(
                "    Moved: (unorganized){}{:?} -> (duplicates){}{:?}",
                std::path::MAIN_SEPARATOR,
                trim_from,
                std::path::MAIN_SEPARATOR,
                trim_to
            );
        }
        PhotisoEvent::FileNoOp { file } => {
            let trim_file = try_trim_prefix(file, &config.directories.unorganized);
            println!(
                "    No-op: (organized){}{:?}",
                std::path::MAIN_SEPARATOR,
                trim_file
            );
        }
        PhotisoEvent::FileSkipped { file, reason } => {
            let trim_file = try_trim_prefix(file, &config.directories.unorganized);
            println!(
                "    Skipped - {}: (unorganized){}{:?}",
                reason,
                std::path::MAIN_SEPARATOR,
                trim_file
            );
        }

        _ => {}
    }
}
