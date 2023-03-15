
import * as express from 'express';
import { DBRecord, Record, Repository } from "./storage";

export const router = express.Router();
const fileName : string = process.env.FILE_DB || "./storage.db";

export var store : Repository = new Repository(fileName);

/**
 * 
 * Firstly we setup the mandatory routes
 */

router.get('/acronym', async (req, res, next) => 
{
    let page : number = parseInt("" + req.query.page) || 1;
    let limit : number = parseInt("" + req.query.limit) || 10;
    if(limit <= 0)
    {
        limit = 10;
    }
    if(page <= 0)
    {
        page = 1;
    }

    let search : string = <string>req.query.search;

    try
    {
        let records : DBRecord = await store.fuzzyFind("acronym", search, page, limit);
        let actualPages = records.total / limit;
        let morePages = (actualPages > page);

        res.setHeader("TOTAL_PAGES", "" + actualPages);
        if(morePages)
        {
            res.setHeader("HAS_MORE", "YES");
        }
        res.json(records.data);
    } catch(e)
    {
        console.log(e);
        res.sendStatus(503).json(e);
    }
});

router.post('/acronym', async (req, res, next) => 
{
    try
    {
        let content = <Record>req.body;
        if((content.acronym == null) || (content.acronym.length == 0))
        {
            res.status(400).json({ error: 'Acronym is Required' });
            return;
        }
        if((content.definition == null) || (content.definition.length == 0))
        {
            res.status(400).json({ error: 'Definition is Required' });
            return;
        }
        content = await store.save(content);
        res.status(200).json(content);
    } catch(e)
    {
        console.log(e);
        res.sendStatus(503).json(e);
    }
});

router.delete('/acronym/:acronymID', async (req, res, next) => 
{
    try
    {
        var acronym = "" + req.params["acronymID"];
        if((acronym == null) || (acronym.length == 0))
        {
            res.status(400).json({ error: 'Acronym is Required' });
            return;
        }
        let key = { acronym : acronym };
        store.delete(key);
        res.status(200).json(key);
    } catch(e)
    {
        console.log(e);
        res.sendStatus(503).json(e);
    }

});

router.patch('/acronym/:acronymID', async (req, res, next) => 
{
    try
    {
        let content = <Record>req.body;
        if((content.definition == null) || (content.definition.length == 0))
        {
            res.status(400).json({ error: 'Definition is Required' });
            return;
        }
        var acronym = "" + req.params["acronymID"];
        if((acronym == null) || (acronym.length == 0))
        {
            res.status(400).json({ error: 'Acronym is Required' });
            return;
        }

        let key = { acronym : acronym };
        content.acronym = acronym;
        content = await store.update(key, content);
        res.status(200).json(content);
    } catch(e)
    {
        console.log(e);
        res.sendStatus(503).json(e);
    }
});

export default router;