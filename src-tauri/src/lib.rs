use std::path::PathBuf;
use tauri::AppHandle;
use tauri_plugin_fs::FsExt;

#[tauri::command]
fn read_file(app: AppHandle, path: String) -> Result<String, String> {
    let pb = PathBuf::from(path);
    let _ = app.fs_scope().allow_file(&pb);
    app.fs()
        .read_to_string(&pb)
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![read_file])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
