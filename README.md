# Tabulous!

Tired of too many tabs? Try this tabulous Chrome extension! Fully open source and fully local. 

## Features

- Summarize content of a tab
- Group tabs by domain name
- Show duplicate tabs (everybody has them ;))

## Installation

### Prerequisites

- Python (version 3.11.6)

To install the extension, follow these steps:

1. **Clone the repository:**
   ```
   git clone https://github.com/naveen-tirupattur/tabulous.git
   cd tabulous
   ```

2. **Create a virtual environment:**

    ```
    # Using venv (Python 3.x)
    python3 -m venv venv

    # Activate the virtual environment (Linux or macOS)
    source venv/bin/activate

    # Activate the virtual environment (Windows)
    venv\Scripts\activate
    ```

3. **Install dependencies:**

    ```
    pip install -r requirements.txt
    ```

4. **Configuration:**

   - Download the appropriate llama2 cpp model from HuggingFace (courtesy of TheBloke) 
     - https://huggingface.co/TheBloke
   - Update .env file the location of model on your local machine

5. **Run the application:**

    ```bash
    make start
    ```
   
6. **Open Google Chrome and go to `chrome://extensions`**
7. **Enable Developer mode by toggling the switch in the top right corner.**
8. **Click on "Load unpacked" and select the directory where you saved the source code.**

## Usage

1. Click on the extension button in the Chrome toolbar.
2. A popup window will appear with options
3. Select the desired action:
   - **Group/Ungroup Tabs (Active Window):** Group tabs within the active window by domain name.
   - **Show

## Code Structure

- `background.js`: Brains of the extension, handles various operations 
- `popup.html`: Represents the HTML content for the popup window that appears when the extension button is clicked.
- `popup.js`: Provides the JavaScript functionality for the popup window.
- `manifest.json`: Defines the metadata and configuration for the Chrome extension.
- `LICENSE`: The license file specifying the GNU General Public License (GPL) terms.

## Customization

This extension provides a basic implementation for tab grouping by domain name. You can customize and enhance the code to suit your specific needs. Some possible enhancements include:

- Adding additional grouping or ungrouping options.
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
