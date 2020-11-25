mod config;
mod file_hash;
mod photo_date_time;
mod photo_organizer;

use crate::config::*;
use crate::photo_organizer::*;

fn main() -> anyhow::Result<()> {
    let config: Config = load_config()?;

    print_header(&config);

    fn create_on_photiso_event(config: Config) -> Box<dyn Fn(PhotisoEvent) -> bool> {
        Box::new(move |event| -> bool {
            on_photiso_event(&config, &event);
            true
        })
    }

    let on_event = create_on_photiso_event(config.clone());

    photo_organizer::organize(
        &config.directories.unorganized,
        &config.directories.organized,
        &config.directories.duplicates,
        on_event,
    )?;

    print_footer(&config);

    Ok(())
}

fn print_header(config: &Config) {
    if config.options.output != "none" {
        println!("========================================");
        println!("Photiso");
        println!("========================================");
        println!();
        println!("Configuration");
        println!("=============");
        println!();
        println!("unorganized: {:?}", config.directories.unorganized);
        println!("organized: {:?}", config.directories.organized);
        println!("duplicates: {:?}", config.directories.duplicates);
        println!();
        println!("stop on error: {:?}", config.options.stop_on_error);
        println!();
        if config.options.output == "compact" {
            println!("Progress Legend");
            println!("======");
            println!(". => a photo was moved to the organized directory.");
            println!("_ => no change (photo is alrady in the correct location).");
            println!("D => a duplicate photo was moved to the duplicates directory.");
            println!("S => a file was skipped.");
            println!("E => there was a problem processing a file.");
            println!();
        }
        println!("========================================");
        if config.options.output == "compact" {
            println!();
            print!("Progress: ")
        }
    }
}

fn print_footer(config: &Config) {
    if config.options.output != "none" {
        println!();
        println!();
        println!("========================================");
    }
}

fn on_photiso_event(config: &Config, event: &PhotisoEvent) -> bool {
    match config.options.output.as_str() {
        "none" => on_photiso_event_none(event),
        "compact" => on_photiso_event_compact(event),
        _ => on_photiso_event_default(event),
    }

    if let PhotisoEvent::FileError { file: _, error: _ } = event {
        if config.options.stop_on_error {
            return false;
        }
    }
    true
}

fn on_photiso_event_none(event: &PhotisoEvent) {
    match event {
        _ => {}
    }
}

fn on_photiso_event_compact(event: &PhotisoEvent) {
    match event {
        PhotisoEvent::FileMoved { from: _, to: _ } => {
            print!(".");
        }
        PhotisoEvent::DuplicateFileMoved { from: _, to: _ } => {
            print!("D");
        }
        PhotisoEvent::FileNoOp { file: _ } => {
            print!("_");
        }
        PhotisoEvent::FileSkipped { file: _, reason: _ } => {
            print!("S");
        }
        PhotisoEvent::FileError { file: _, error: _ } => {
            print!("E");
        }

        _ => {}
    }
}

fn on_photiso_event_default(event: &PhotisoEvent) {
    match event {
        PhotisoEvent::DirStarted { dir } => {
            println!("{:?}", dir);
        }
        PhotisoEvent::DirFinished { dir: _ } => {
            println!();
        }
        PhotisoEvent::FileMoved { from, to } => {
            println!("  Photo moved: {:?} -> {:?}", from, to);
        }
        PhotisoEvent::DuplicateFileMoved { from, to } => {
            println!("  Duplicate photo moved: {:?} -> {:?}", from, to);
        }
        PhotisoEvent::FileNoOp { file } => {
            println!("  Already correct: {:?}", file);
        }
        PhotisoEvent::FileSkipped { file, reason } => {
            println!("  File skipped: {:?} -> {}", file, reason);
        }
        PhotisoEvent::FileError { file, error } => {
            println!("  File error: {:?} -> {:?}", file, error);
        }

        _ => {}
    }
}
