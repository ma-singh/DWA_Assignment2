# Book Collection API

A RESTful API for storing information on a collection of books

## Prerequisites

To begin with, you should have:
* A server with Ubuntu 16.04 installed
* Nginx installed on that server.
* A non-root user with `sudo` privileges.

Before you install any software, make sure you update Ubuntu's packages

```
sudo apt-get update && sudo apt-get upgrade
```

#### Public Key Authentication with SSH
From your **local machine** run 
```
ssh-keygen
```
Depending on what your username is, you should see something similar to 
```
Generating public/private rsa key pair.
Enter file in which to save the key (/Users/USERNAME/.ssh/id_rsa):
```
It's highly recommended that you change this filename (make sure you include the path) to be a bit more descriptive.
You will be prompted to enter a *passphrase* which you may leave blank if you wish.

##### Manually Installing the Key

Again on your **local** machine, print out the value of the key you just created with: 
```
cat ~/.ssh/id_rsa.pub
```
Select the key that has just printed out to the terminal and copy it to your clipboard. 
Now, switch to the **server** and your **root** user, and switch to the user that we created.
```
su USERNAME
```
From the new user's home directory, run the following commands:
```
mkdir ~/.ssh
chmod 700 ~/.ssh
```
Now we're going to create a file in our new `.ssh` directory by running:
```
nano ~/.ssh/authorized_keys
```
Paste the SSH key you copied to your clipboard into this file, then save and close it by pressing `CTRL + X` and then answering *yes* and pressing `Enter`

Now we need to restrict permissions to that `authorized_keys` file
```
chmod 600 ~/.ssh/authorized_keys
```
Return to the `root` user with the command
```
exit
```

## Install Node.js

To install Node.js, begin from your `home` directory and run the command to retrieve the installation script from the Nodesource package archives
```
cd ~
curl -sL https://deb.nodesource.com/setup_6.x -o nodesource_setup.sh
```
Run the script using:
```
sudo bash nodesource_setup.sh
```
After running the setup script, you can then install Node.js with `npm` bundled in as well
```
sudo apt-get install nodejs
```
Though `npm` is included you will also need an additional package to run it properly
```
sudo apt-get install build-essential
```

## Creating a Hello World Application

We're going to test our current setup by creating a simple Hello World! application using Node.
```
cd ~
nano hello.js
```
In the editor enter the following
```
#!/usr/bin/env nodejs
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(8080, 'localhost');
console.log('Server running at http://localhost:8080/');
```
Save and exit the file with `CTRL+X`, answering yes, then pressing `ENTER` to close the editor

#### Test the Application

To check if our application works, we need to make the file executable
```
chmod +x ./hello.js
```
We can now run the application
```
chmod +x ./hello.js
```
To see our "Hello World!" output, in another server session inside our terminal we can run: 
```
curl http://localhost:8080
```
**Note**: *This is running on localhost:8080 in your terminal's server session window, not your actual web server and will not work in your browser*

You can close the terminal window you tested the output in, and then stop the application you ran the `hello.js` command in by entering `CTRL+C`

### Install PM2

Now we're going to install a process manager for Node called PM2, which will allow us to see our output in the browser and run our application in the background as a service.
```
sudo npm install -g pm2
```

#### Start Your Application

You can now use PM2 to start your application
```
pm2 start hello.js
```
Now we're also going to use PM2 to have our application restart if it crashes.
```
pm2 startup systemd
```
Copy the last line output by the command, which you will then run as a superuser

## Set Up Nginx as a Reverse Proxy Server

Our application is now running on our server's localhost, but we need other users to be able to access it. We can do this with Nginx
```
sudo nano /etc/nginx/sites-available/default
```

In the `server` block, there should be a `location /` block. Replace it's contents

```
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
```
This allows users to access the server at `http://IP_ADDRESS/` and receive the response from `hello.js`
Save and close the file with `CTRL+X` and then answer *yes* and press `ENTER`. 
Check for any syntax errors in the file you just edited
```
sudo nginx -t
```
Finish by restarting Nginx
```
sudo systemctl restart nginx
```

If your application is still running (You never ran `pm2 stop hello.js`) you should now be able to enter your domain or IP address in your browser and view your Hello World application.
