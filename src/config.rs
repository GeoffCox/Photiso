use serde::Deserialize;
use std::{fs::File, io, io::Read, path::Path, path::PathBuf};

#[derive(Clone, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ConfigDirectories {
    pub unorganized: PathBuf,
    pub organized: PathBuf,
    pub duplicates: PathBuf,
}

#[derive(Clone, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ConfigOptions {
    pub output: String,
    pub stop_on_error: bool,
}

#[derive(Clone, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub directories: ConfigDirectories,
    pub options: ConfigOptions,
}

pub fn load_config() -> io::Result<Config> {
    let path = Path::new("./photiso.toml");

    let mut file = File::open(&path)?;

    let mut s = String::new();
    file.read_to_string(&mut s)?;

    Ok(toml::from_str(&s)?)
}

// impl Clone for ConfigOptions {
//     fn clone(&self) -> ConfigOptions {
//         ConfigOptions {
//             output: self.output.clone(),
//             stop_on_error: self.stop_on_error
//         }
//     }
// }
// impl Clone for Config {
//     fn clone(&self) -> Config {
//         unorganized: self.unorganized.clone(),
//         organize(unorganized_dir: &Path, organized_dir: &Path, duplicates_dir: &Path, event_handler: F)
//         ConfigOptions {
//             output: self.output.clone(),
//             stop_on_error: self.stop_on_error
//         }
//     }
// }
