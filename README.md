# Delivery Fee System

This project is a Node.js application built with Express that calculates delivery fees based on the distance between manufacturers and wholesalers. It also provides functionalities for group and private chat among users.

## Features

- Calculate delivery fees based on distance.
- Group chat functionality for manufacturers and wholesalers.
- Private chat options for individual manufacturers and wholesalers.
- Backend communication interface for seamless integration.

## Project Structure

```
delivery-fee-system
├── src
│   ├── app.js
│   ├── controllers
│   ├── db
│   │   └── index.js
│   ├── jobs
│   │   └── cronJob.js
│   ├── middlewares
│   │   └── auth.js
│   ├── models
│   │   ├── ChatGroup.js
│   │   ├── Delivery.js
│   │   ├── Message.js
│   │   └── User.js
│   ├── routes
│   │   ├── auth.js
│   │   ├── chat.js
│   │   └── delivery.js
│   └── utils
│       ├── getDistance.js
│       └── redisClient.js
├── package.json
├── .env
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd delivery-fee-system
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory and add your environment variables.
   ```
   MONGO_URI=<mongo_uri>
   SESSION_SECRET=<secret_key>
   ENV=development
   ```

## Usage

1. Start the application:
   ```
   npm start
   ```

2. Access the API endpoints for delivery fee calculations, group chat, and private chat as defined in the routes.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.