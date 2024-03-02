# Digidrobe

Digidrobe is a Node.js project that allows users to upload and manage all of their clothing items within their web browser. Users can directly upload images of clothing items, view them in a grid layout, set additional information such as brand and type, and delete items as needed.

## Features

- Upload clothing item images
- View uploaded items in a grid layout
- Set additional information (brand, type) for each item
- Delete items from the wardrobe

## Technologies Used

- Node.js is used as the backend server for Digidrobe.
- Express is a backend web application framework.
- Multer is a middleware for file uploads.
- SQLite is a database management system used to store and manage all the data.
- EJS is a templating language used to generate contextual dynamic HTML content.

## Installation

Make sure you have Node.js and npm installed on your system. If not, you can download and install them from [here](https://nodejs.org/).

1. Clone the repository:
   ```bash
   git clone https://github.com/LucasCur/digidrobe.git
   ```

2. Navigate into the project directory:
   ```bash
   cd digidrobe
   ```

3. Install dependencies using npm: 
   ```bash
   npm install
   ```

## Usage

1. Start the server:

   ```bash
   node app.js
   ```

By default, the server will run on port 3000. If port 3000 is already in use, the server will automatically choose another available port.

2. Open your web browser and go to `http://localhost:3000` (or the dynamically chosen port if not 3000).
3. Click on the "Upload" button to add a piece of clothing.
4. View and manage your uploaded items on the main page.
5. Click on the "View" button to set additional information for each item.

## Contributing

Contributions are more than welcome! If you have any suggestions, improvements, feature requests, or even want to just ask me a quick question, feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
