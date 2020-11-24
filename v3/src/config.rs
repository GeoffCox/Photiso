use serde::Deserialize;
use std::{fs::File, io, io::Read, path::Path, path::PathBuf};

#[derive(Deserialize, Debug)]
pub struct ConfigDirectories {
    pub unorganized: PathBuf,
    pub organized: PathBuf,
    pub duplicates: PathBuf,
}

#[derive(Deserialize, Debug)]
pub struct ConfigOptions {
    pub output: String,
}

#[derive(Deserialize, Debug)]
pub struct Config {
    pub directories: ConfigDirectories,
    pub options: ConfigOptions,
}

pub fn load_config() -> io::Result<Config> {
    let path = Path::new("./Photiso.toml");

    let mut file = File::open(&path)?;

    let mut s = String::new();
    file.read_to_string(&mut s)?;

    Ok(toml::from_str(&s)?)
}
