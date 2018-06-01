# Based on the wonderful jrottenberg ffmpeg image
FROM jrottenberg/ffmpeg

# install some stuff jrottenberg probably took out
RUN apt-get update
# this will get node installed at a version that works and is supported
RUN apt-get -y install curl
RUN apt-get -y install npm
RUN which npm
#RUN npm install -g npm@5.10.0
#RUN which npm
#RUN apt-get -y remove npm
#RUN which npm
RUN npm install -g n 
RUN n 8.11.2
RUN which npm
RUN which node

# I put the app in opt. Is this right? I don't know...

RUN mkdir /opt/Subtitler-Nodejs
WORKDIR /opt/Subtitler-Nodejs
COPY . .

# install the Subtitler-Nodejs app
RUN npm install

# ffmpeg is normally in /usr/local/bin
#RUN which ffmpeg
RUN echo $PATH
RUN which npm
RUN npm --version
RUN node --version

EXPOSE 8888

ENTRYPOINT ["npm"]
CMD ["start"]
