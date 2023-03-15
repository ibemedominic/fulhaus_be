
import * as express from 'express';
import { DBRecord, Record, Repository } from "./storage";

var content = 
[{
	_id : "507f191e810c19729de860eb",
	acronym : "2B",
	definition : "To be"
}, {
	_id : "507f191e810c19729de860ec",
	acronym : "2EZ",
	definition : "Too easy"
}, {
	_id : "507f191e810c19729de860ed",
	acronym : "2G2BT",
	definition : "Too good to be true"
}]

export async function initialize(store : Repository)
{
	let existing : Record[] = await store.readAll();
	if(existing.length == 0)
	{
		await store.saveMany(content);
	}
}