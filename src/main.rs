mod config;
mod file_hash;
mod photo_date_time;
mod photo_organizer;

use crate::config::*;
use crate::photo_organizer::*;

fn main() -> anyhow::Result<()> {
    let config: Config = load_config()?;

    print_header(&config);

    let on_event = create_on_photiso_event(config.clone());

    let result = photo_organizer::organize(
        &config.directories.unorganized,
        &config.directories.organized,
        &config.directories.duplicates,
        on_event,
    )?;

    print_footer(&config, &result);

    Ok(())
}

fn create_on_photiso_event(config: Config) -> Box<dyn Fn(OrganizeEvent) -> bool> {
    Box::new(move |event| -> bool {
        on_photiso_event(&config, &event);
        true
    })
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
            println!("* => a duplicate photo was moved to the duplicates directory.");
            println!("^ => a file was skipped.");
            println!("! => there was a problem processing a file.");
            println!();
        }
        println!("========================================");
        if config.options.output == "compact" {
            println!();
            print!("Progress: ")
        }
    }
}

fn print_footer(config: &Config, result: &OrganizeResult) {
    if config.options.output != "none" {
        println!();
        println!();
        println!("========================================");
        println!();
        println!("Directories: {}", result.dirs);
        println!("Directories Skipped: {}", result.dirs_skipped);
        println!();
        println!("Files: {}", result.files);
        println!("Moved: {}", result.photos_moved);
        println!("Duplicates: {}", result.duplicate_photos_moved);
        println!("Skipped: {}", result.files_skipped);
        println!("Already correct: {}", result.photos_noop);
        println!("Errors: {}", result.files_errored);
        println!();
        println!("Duration: {:?}", result.duration);

        let duration = result.duration.as_secs_f64();
        if duration > 0.0 {
            println!("Files/Sec: {:?}", result.files as f64 / duration);
        } else {
            println!("Files/Sec: (unmeasurable)");
        }
        println!();
        println!("========================================");
    }
}

fn on_photiso_event(config: &Config, event: &OrganizeEvent) -> bool {
    match config.options.output.as_str() {
        "none" => on_photiso_event_none(event),
        "compact" => on_photiso_event_compact(event),
        _ => on_photiso_event_default(event),
    }

    if let OrganizeEvent::FileError { file: _, error: _ } = event {
        if config.options.stop_on_error {
            return false;
        }
    }
    true
}

fn on_photiso_event_none(event: &OrganizeEvent) {
    match event {
        _ => {}
    }
}

fn on_photiso_event_compact(event: &OrganizeEvent) {
    match event {
        OrganizeEvent::PhotoMoved { from: _, to: _ } => {
            print!(".");
        }
        OrganizeEvent::DuplicatePhotoMoved { from: _, to: _ } => {
            print!("*");
        }
        OrganizeEvent::PhotoNoOp { file: _ } => {
            print!("_");
        }
        OrganizeEvent::FileSkipped { file: _, reason: _ } => {
            print!("^");
        }
        OrganizeEvent::FileError { file: _, error: _ } => {
            print!("!");
        }

        _ => {}
    }
}

fn on_photiso_event_default(event: &OrganizeEvent) {
    match event {
        OrganizeEvent::DirStarted { dir } => {
            println!("{:?}", dir);
        }
        OrganizeEvent::DirFinished { dir: _ } => {
            println!();
        }
        OrganizeEvent::PhotoMoved { from, to } => {
            println!("  Photo moved: {:?} -> {:?}", from, to);
        }
        OrganizeEvent::DuplicatePhotoMoved { from, to } => {
            println!("  Duplicate photo moved: {:?} -> {:?}", from, to);
        }
        OrganizeEvent::PhotoNoOp { file } => {
            println!("  Already correct: {:?}", file);
        }
        OrganizeEvent::FileSkipped { file, reason } => {
            println!("  File skipped: {:?} -> {}", file, reason);
        }
        OrganizeEvent::FileError { file, error } => {
            println!("  File error: {:?} -> {:?}", file, error);
        }

        _ => {}
    }
}
