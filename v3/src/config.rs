use serde::Deserialize;
use std::{fs, fs::File, io, io::Read, path::Path, path::PathBuf};

#[derive(Deserialize, Debug)]
pub struct Config {
    pub directories: ConfigDirectories,
}

#[derive(Deserialize, Debug)]
pub struct ConfigDirectories {
    pub unorganized: PathBuf,
    pub organized: PathBuf,
    pub duplicates: PathBuf,
}

pub fn load_config() -> io::Result<Config> {
    let path = Path::new("./Photiso.toml");

    let mut file = File::open(&path)?;

    let mut s = String::new();
    file.read_to_string(&mut s)?;

    let config: Config = toml::from_str(&s)?;

    let config = Config {
        directories: ConfigDirectories {
            unorganized: fs::canonicalize(&config.directories.unorganized.as_path())?,
            organized: fs::canonicalize(&config.directories.organized.as_path())?,
            duplicates: fs::canonicalize(&config.directories.duplicates.as_path())?,
        },
    };

    Ok(config)
}
