# MeetMate

MeetMate is a video call meeting application with added AI functionality for answering questions. It allows users to conduct video meetings while also providing the ability to ask questions to an AI assistant.

## Features

- Conduct video call meetings similar to Google Meet.
- Ask questions to an AI assistant and receive answers.
- Store questions and answers in a MongoDB database.

## Technologies Used

- Django for the backend.
- OpenAI's Whisper model for speech-to-text conversion.
- Microsoft's PHI model for question answering.
- MongoDB for storing questions and answers.

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/meetmate.git
   ```

2. Install the required Python packages:

   ```
   pip install -r requirements.txt
   ```

3. Start the Django development server:

   ```
   python manage.py runserver
   ```

4. Access the application at `http://localhost:8000/`.

## Usage

1. Navigate to the application in your web browser.
2. Start a new meeting or join an existing one.
3. Use the chat interface to ask questions to the AI assistant.
4. Receive answers from the AI assistant.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## Acknowledgments

- Inspiration from Google Meet and other video call meeting applications.
