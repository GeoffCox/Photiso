# An example of sending a closure as a parameter to a function.

## The function being called

```Rust
pub fn organize<F>(
    unorganized_dir: &Path,
    organized_dir: &Path,
    duplicates_dir: &Path,
    event_handler: F,
) -> anyhow::Result<()>
where
    F: Fn(PhotisoEvent) -> bool,
{
    ...
}
```

## The curried function creation that returns the boxed closure

```Rust
fn create_on_photiso_event(config: Config) -> Box<dyn Fn(PhotisoEvent) -> bool> {
    Box::new(move |event| -> bool {
        on_photiso_event(&config, event);
        true
    })
}
```

## Making the call

```Rust
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
```

