#!/bin/bash

echo "🚀 Starting Event Networking Platform..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   On Ubuntu/Debian: sudo systemctl start mongod"
    echo "   On macOS with Homebrew: brew services start mongodb-community"
    echo "   Or run: mongod"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd client && npm install --legacy-peer-deps && cd ..
fi

# Start the backend server
echo "🔧 Starting backend server..."
npm run dev &

# Wait a moment for the backend to start
sleep 3

# Start the frontend
echo "🎨 Starting frontend..."
cd client && npm start

echo "✅ Application started successfully!"
echo "   Backend: http://localhost:5000"
echo "   Frontend: http://localhost:3000"