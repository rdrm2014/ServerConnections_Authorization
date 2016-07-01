Node.js - Server_Conns
================


Getting started
---------------


Introduction
------------

- [Node.js](http://nodejs.org/)
- [Socket.io](http://socket.io/)


Requirements
------------

- Node.js :  [http://nodejs.org/](http://nodejs.org/)
- Socket.io:  [http://socket.io/](http://socket.io/)


Init Server
------------

node server.js

(If don't work!)
npm install


Topics
A topic is a UTF-8 string, which is used by the broker to filter messages for each connected client. A topic consists of one or more topic levels. Each topic level is separated by a forward slash (topic level separator).

topic_basics

In comparison to a message queue a topic is very lightweight. There is no need for a client to create the desired topic before publishing or subscribing to it, because a broker accepts each valid topic without any prior initialization.

Here are a few example topics:

myhome/groundfloor/livingroom/temperature
USA/California/San Francisco/Silicon Valley
5ff4a2ce-e485-40f4-826c-b1a5d81be9b6/status
Germany/Bavaria/car/2382340923453/latitude
Noticeable is that each topic must have at least 1 character to be valid and it can also contain spaces. Also a topic is case-sensitive, which makes myhome/temperature and MyHome/Temperature two individual topics. Additionally the forward slash alone is a valid topic, too.

Wildcards
When a client subscribes to a topic it can use the exact topic the message was published to or it can subscribe to more topics at once by using wildcards. A wildcard can only be used when subscribing to topics and is not permitted when publishing a message. In the following we will look at the two different kinds one by one: single level and multi level wildcards.

Single Level: +
As the name already suggests, a single level wildcard is a substitute for one topic level. The plus symbol represents a single level wildcard in the topic.

topic_wildcard_plus

Any topic matches to a topic including the single level wildcard if it contains an arbitrary string instead of the wildcard. For example a subscription to myhome/groundfloor/+/temperature would match or not match the following topics:

topic_wildcard_plus_example

Multi Level: #
While the single level wildcard only covers one topic level, the multi level wildcard covers an arbitrary number of topic levels. In order to determine the matching topics it is required that the multi level wildcard is always the last character in the topic and it is preceded by a forward slash.

topic_wildcard_hash

topic_wildcard_hash_example

A client subscribing to a topic with a multi level wildcard is receiving all messages, which start with the pattern before the wildcard character, no matter how long or deep the topics will get. If you only specify the multilevel wildcard as a topic (#), it means that you will get every message sent over the MQTT broker. If you expect high throughput this is an anti pattern, see the best practices below.

