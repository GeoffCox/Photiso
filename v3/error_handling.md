# How to do manual error aggregation

```Rust
#[derive(Debug)]
enum PhotisoError {
    General(&'static str),
    Exif(exif::Error),
    Io(io::Error),
    Parse(chrono::ParseError),
    SystemTime(std::time::SystemTimeError)
}

impl From<exif::Error> for PhotisoError {
    fn from(err: exif::Error) -> PhotisoError {
        PhotisoError::Exif(err)
    }
}

impl From<io::Error> for PhotisoError {
    fn from(err: io::Error) -> PhotisoError {
        PhotisoError::Io(err)
    }
}

impl From<chrono::ParseError> for PhotisoError {
    fn from(err: chrono::ParseError) -> PhotisoError {
        PhotisoError::Parse(err)
    }
}

impl From<std::time::SystemTimeError> for PhotisoError {
    fn from(err: std::time::SystemTimeError) -> PhotisoError {
        PhotisoError::SystemTime(err)
    }
}


impl std::error::Error for PhotisoError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match *self {
            PhotisoError::General(_) => None,
            PhotisoError::Io(ref err) => Some(err),
            PhotisoError::Exif(ref err) => Some(err),
            PhotisoError::Parse(ref err) => Some(err),
            PhotisoError::SystemTime(ref err) => Some(err),
        }
    }
}

impl fmt::Display for PhotisoError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            PhotisoError::General(ref err) => write!(f, "General Error: {}", err),
            PhotisoError::Exif(ref err) => write!(f, "Exif error: {}", err),
            PhotisoError::Io(ref err) => write!(f, "IO error: {}", err),
            PhotisoError::Parse(ref err) => write!(f, "Parse error: {}", err),
            PhotisoError::SystemTime(ref err) => write!(f, "Time error: {}", err),
        }
    }
}
```

# How to do use thiserror to do the same thing (thiserror = "1.0.22")

```Rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum PhotisoError {
    #[error("A problem occurred. `{0}`")]
    General(&'static str),
    #[error("A problem occurred. `{0}`")]
    Io(#[from] io::Error),
    #[error("A problem occurred. `{0}`")]
    Parse(#[from] chrono::ParseError),
    #[error("A problem occurred. `{0}`")]
    Exif(#[from] exif::Error),
    #[error("A problem occurred. `{0}`")]
    SystemTime(#[from] std::time::SystemTimeError)
}
```
