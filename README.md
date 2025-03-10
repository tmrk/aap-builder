# AAP Builder

AAP Builder is a web app, for creating, managing, and exporting Anticipatory Action Plans (AAP). The project leverages React, Material-UI, and a context-based architecture to deliver a dynamic, multi-step form builder that supports internationalisation, customisation, and DOCX export.

## Features

- **Dynamic Multi-Step Form Builder:** Create and manage AAPs with an interactive vertical stepper interface.
- **Internationalization:** Built-in support for multiple languages (e.g., English, French, Portuguese) using a custom `LanguageContext`.
- **Localised Country Dropdown:** The `useCountries` hook fetches an online dataset of countries and displays country names in the app’s current language. For Portuguese (and more languages in the future), the hook uses a custom list from the translation file if provided.
- **DOCX Export:** Export your AAP to a DOCX file with dynamically generated filenames that use localized country names and other plan data.
- **Template Selector & Settings Drawer:** Choose from different AAP templates and adjust settings such as language and text field behavior.

## Demo

https://tmrk.github.io/aap-builder/

## License

MIT