pub use anyhow::*;
use data_encoding::HEXUPPER;
use ring::digest::{Context, SHA256};
use std::io::Read;
use std::{fs, fs::File, path::Path};

pub fn get_file_hash(file_path: &Path) -> anyhow::Result<String> {
    let file = File::open(&file_path)?;
    let metadata = fs::metadata(file_path)?;

    let mut bufreader = std::io::BufReader::new(&file);

    let mut context = Context::new(&SHA256);
    let mut buffer = [0; 1024];

    loop {
        let count = bufreader.read(&mut buffer)?;
        if count == 0 {
            break;
        }
        context.update(&buffer[..count]);
    }

    let hash = context.finish();
    Ok(HEXUPPER.encode(hash.as_ref()))
}
