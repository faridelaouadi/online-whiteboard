# Online Collab whiteboard

Project description
----

- Create a collaborative whiteboard tool similar to webwhiteboard.com

![Alt Text](https://media.giphy.com/media/fxeR94k8HUpDhHREe3/giphy.gif)

Full video demonstration --> https://youtu.be/ZKu6Bnap3KI

Features
---

- Users enter their username
- Users then enter a room ID or create a private room. The room ID is a 16 char hex string that is randomly generated client side. (Still need to make sure that the room ID doesn't exist already on the server which is a low priority addition)
- Once the user is in the room, they can draw on the canvas with everyone else in the room
- They can also communicate with one another using the chat feature which includes sending and receiving GIFs

Room for improvement
---

- More validation across all user input
- Add the functionality for sending documents in the chat feature
- Include a feature where users see each other (VOIP) while in the room
- Add notifications for when users send messages in the rooms

How to run?
---

- install all requirements in requirements.txt
- then run python application.py in terminal

Similar Startups
---

https://zapier.com/blog/best-online-whiteboard/
