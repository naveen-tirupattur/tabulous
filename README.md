# Tabulous!

Tired of too many tabs? Try this tabulous Chrome extension! Fully open source and fully local. 

## Features

- Group tabs by domain name
- Show duplicate tabs

## Installation

### Prerequisites

To install the extension, follow these steps:

1. **Clone the repository:**
   ```
   git clone https://github.com/naveen-tirupattur/tabulous.git
   cd tabulous
   ```

2. **Run the application:**

    ```
    make start
    ```
   
3. **Open Google Chrome and go to `chrome://extensions`**
4. **Enable Developer mode by toggling the switch in the top right corner.**
5. **Click on "Load unpacked" and select the directory where you saved the source code.**

## Usage

1. Click on the extension button in the Chrome toolbar.
2. A popup window will appear with options
3. Select the desired action:
   - **Group/Ungroup Tabs (Active Window):** Group tabs within the active window by domain name.
   - **Show Duplicates:** Show duplicate tabs across all windows.

## Code Structure
    - src/main/js
        - `background.js`: Handles clean up of chrome storage
        - `popup.js`: Provides the core functionality of the plugin
        - `content.js`: Content script that runs in the context of the web page being viewed or accessed.
                        It allows the extension to interact with the DOM (Document Object Model) of the webpage.
        - `readbility.js`: JavaScript library or script designed to extract and parse content from web pages

    - src/main/ui
        - `popup.html`: Represents the HTML content for the popup window that appears when the extension button is clicked.

    - `manifest.json`: Defines the metadata and configuration for the Chrome extension.
    - `LICENSE`: The license file specifying the GNU General Public License (GPL) terms.

## Coming Soon

- Streaming output from LLM
- Chat about content of tab/s
- Group by semantic content of the tabs

## Customization

You can customize and enhance this code to suit your specific needs. Some possible enhancements include:

- Adding additional grouping options.
- Implementing advanced tab management features.
- Customizing the extension's appearance and behavior.

Feel free to explore the code and make modifications according to your requirements.

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).

## Disclaimer

This extension is provided as-is without any warranty. Use it at your own risk.

## Contributing

Contributions are welcome! If you have any ideas, improvements, or bug fixes, please submit a pull request or open an issue.

## Credits

This extension was developed by Naveen Tirupattur.

## Contact

For any inquiries or questions, please contact naveen.tirupattur@gmail.com
