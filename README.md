# Chemistry for Mechanical Engineers

Interactive teaching material for BME 1104 Chemistry for Mechanical Engineers. Everything is static HTML and JavaScript, with no build step and nothing to install. It is hosted free with GitHub Pages.

| Material | Folder | Contents |
|---|---|---|
| BME 1104 interactive notes | [`bme1104/`](bme1104/) | All ten chapters as 16:9 slide decks with 3D molecules, crystals and lab apparatus (three.js, in `vendor/`), live simulations, worked examples and self-checks: properties of materials, atomic structure, bonding, equilibrium, acids and bases, electrochemistry, solids, carbon compounds, polymers, fuels and combustion. The Chapter 10 decks (applications and chemical instrumentation) are in `bme1104/ch10/` |
| Chemistry lecture | [`chemistry/`](chemistry/) | One slide lecture: combustion, galvanic corrosion and carburising, then calibration and Beer–Lambert, the pH meter, the bomb calorimeter and flue gas analysis |

Other courses live in their own repositories: [Mechanics of Machines I and II](https://github.com/olomo-umu/mechanics-labs), [Power Systems and Clean Energy Integration](https://github.com/olomo-umu/power-systems-course), [Solar Installer Training](https://github.com/olomo-umu/solar-installer-training) and [Uganda Electricity Atlas](https://github.com/olomo-umu/uganda-electricity-atlas).

## Publish with GitHub Pages

1. Create a new **public** repository named `chem` under your account.
2. Upload the *contents* of this folder to the repository root (drag and drop on **Add file, Upload files**), then commit. Include the empty `.nojekyll` file.
3. Open **Settings, Pages**. Under **Build and deployment**, choose **Deploy from a branch**, branch **main**, folder **/ (root)**, and save.
4. After a minute or two the site is live at `https://<your-username>.github.io/chem/`.

## Editing the BME 1104 chapters

Each chapter page (`bme1104/<chapter>.html`) is ordinary HTML with its interactive parts in `bme1104/assets/<chapter>.js` and the shared chemistry code in `bme1104/assets/chem.js`. Equations are already typeset, so the pages work offline.

## Licence

Text CC BY 4.0, code MIT (see `LICENSE`). KaTeX and mhchem (MIT), three.js (MIT), Roboto (Apache 2.0).
