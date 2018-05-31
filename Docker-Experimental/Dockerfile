# specify the node base image with your desired version node:<version>
FROM jrottenberg/ffmpeg

EXPOSE 8888

# Home directory for Node-RED application source code.
RUN mkdir -p /usr/src/node

WORKDIR /usr/src/node

# package.json contains Node-RED NPM module and node dependencies
COPY package.json /usr/src/node-red/
RUN npm install

# User configuration directory volume
EXPOSE 1880
#EXPOSE 8888
#EXPOSE 8000

WORKDIR /data
RUN npm install node-red-contrib-media-utils
RUN npm install DTHompson55/Watson_Closed_Captioning.git
#RUN git clone https://github.com/DTHompson55/subtitles-ui.git
COPY flows.json .
COPY settings.js .

#WORKDIR /data/subtitles-ui
#RUN npm install
#RUN cp node-red/* ..

WORKDIR /usr/src/node-red

# Environment variable holding file path for flows configuration
ENV FLOWS=/data/flows.json

CMD ["npm", "start", "--", "--userDir", "/data"]











WORKDIR /usr/src/app 

COPY package*.json ./
COPY . .

RUN npm install

CMD ["npm", "start"]
