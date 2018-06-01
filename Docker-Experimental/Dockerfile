# specify the node base image with your desired version node:<version>
FROM jrottenberg/ffmpeg

RUN apt-get update

RUN apt-get -y install curl
RUN apt-get -y install npm
RUN npm install -g n 
RUN n stable
#RUN apt-get -y remove nodejs

WORKDIR /opt
RUN mkdir Subtitler-Nodejs

WORKDIR /opt/Subtitler-Nodejs
COPY .. .
RUN ls -alt


RUN npm install
COPY .env /opt/Subtitler-Nodejs/.env

RUN which ffmpeg

EXPOSE 8888

CMD ["npm", "start", "--", "--userDir", "/opt/Subtitler-Nodejs"]
