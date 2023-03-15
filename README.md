# Fulhaus Node JS BE Project

&nbsp;

## 📁 Table of Contents

-   [🧠 Purpose](#-purpose)
-   [👟 Running the Project](#-running-the-project)
-   [💬 Server](#-server)
-   [🔐 Closing Remarks](#-closing-remarks)

&nbsp;

## 🧠 Purpose

This project provides a set of apis for storing, updating and retrieving acronyms from a file store.
The Project was implemented using Node JS, Typescript and Node js Express 
The Application does not require any external implementations, it uses a file as its storage

To run the application, the following Environment variables must be present, 

FILE_DB - This specifies the location where the file database would be stored, it defaults to ./storage.db

PORT -  This specifies the port on which the server would run, this defaults to 3000

FUZZY_THRESHOLD  - This specifies the level of fuzziness in the string that is acceptable
				We implemented the levenshtein algorithm to help handle fuzzy searches.
				the default threshold is 2.

&nbsp;

## 🧠 APIs

The Application provides the following Apis for the following functionalities

Path = /acronym   
Request Method = GET  
Query Parameters : page - The current page to be retrieved
					limit - The number of records per page
					search - The specifies the fuzzy search parameter
					
Description = This returns the list of acronyms that fuzzily matches the request specified


Path = /acronym  
Request Method = POST  
JSON BODY :   {  acronym : <string>,  definition : <string> }

Description = This is used to Create a new Acronym.  
				Both acronym and definition must be specified otherwise, the system returns an appropriate error (400) and status

Path = /acronym/<acronymID>  
Request Method = PATCH  
JSON BODY :   {  acronym : <string>,  definition : <string> }

Description = This is used to update an existing Acronym.  
				The definition must be specified otherwise, the system returns an appropriate error (400) and status


Path = /acronym/<acronymID>  
Request Method = DELETE  
Path Parameters : acronymID  The Acronym to be Removed  
Description = This is used to Delete an Acronym.  


&nbsp;

## 👟 Running the Project

The project is written in typescript and so must be compiled first.
but first we need to run npm update to update the modules

```bash
	npm install
```

To Compile the project, run the command

```bash
	npm run build
```

To Run the project, run the command

```bash
	npm start
```


&nbsp;

**The server will start on port 3000 (http://localhost:3000) and should be ready to recieve api requests** or the default port specified

&nbsp;
