import * as fs from 'fs';
import {v4 as uuidv4} from 'uuid';

let threshold = parseInt(process.env.FUZZY_THRESHOLD || "2");

/**
 * This computes the Levenshtein distance from both strings
 * @param a The first Value
 * @param b The Second Value
 * @returns 
 */
export function levenshtein(a: string, b: string): number
{
	const an = a ? a.length : 0;
	const bn = b ? b.length : 0;
	if (an === 0)
	{
		return bn;
	}
	if (bn === 0)
	{
		return an;
	}
	const matrix = new Array<number[]>(bn + 1);
	for (let i = 0; i <= bn; ++i)
	{
		let row = matrix[i] = new Array<number>(an + 1);
		row[0] = i;
	}
	const firstRow = matrix[0];
	for (let j = 1; j <= an; ++j)
	{
		firstRow[j] = j;
	}
	for (let i = 1; i <= bn; ++i)
	{
		for (let j = 1; j <= an; ++j)
		{
			if (b.charAt(i - 1) === a.charAt(j - 1))
			{
				matrix[i][j] = matrix[i - 1][j - 1];
			}
			else
			{
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1], // substitution
					matrix[i][j - 1], // insertion
					matrix[i - 1][j] // deletion
				) + 1;
			}
		}
	}
	return matrix[bn][an];
};

export type Record = 
{
	_id : string;
	acronym : string;
	definition : string;
};

export type DBRecord = 
{
	total : number;
	data : Record[]
}

export class Repository
{

	private fd : number;

	constructor(private file : string)
	{
	}

	open()
	{
		if(!fs.existsSync(this.file))
		{
			this.fd = fs.openSync(this.file, 'w+');
		} else {
			this.fd = fs.openSync(this.file, 'a+');
		}
		fs.closeSync(this.fd);
	}

	close()
	{
		//fs.closeSync(this.fd);
	}

	async readAll() : Promise<Record[]>
	{
		var result = new Promise<any>((resolve, reject)=>
		{
			fs.readFile(this.file, { encoding : 'utf8' }, (err, data : string)=>
			{
				if(err != null)
				{
					reject(err);
				} else {
					if((data == null) || (data.length == 0))
					{
						resolve([]);
						return;
					} else {
						let records : Record[] = JSON.parse(data).map((a : any) => <Record>a);
						resolve(records)
					}
				}
			});
		});
		return result;
	}

	async writeRecords(data : Record[]) : Promise<any>
	{
		var result = new Promise<any>((resolve, reject)=>
		{
			let content = JSON.stringify(data);
			fs.writeFile(this.file, content, { encoding : 'utf8' }, (err)=>
			{
				if(err != null)
				{
					reject(err);
				} else {
					resolve(null)
				}
			});
		});
		return result;
	}

	async save(data : Record) : Promise<Record>
	{
		let records : Record[] = await this.readAll();
		data._id = uuidv4();
		records.push(data);
		await this.writeRecords(records);
		return data;
	}

	async saveMany(data : Record[]) : Promise<Record[]>
	{
		let records : Record[] = await this.readAll();
		data.forEach((entry)=>
		{
			entry._id = uuidv4();
			records.push(entry);
		});
		await this.writeRecords(records);
		return data;
	}

	async update(key : any, data : Record) : Promise<Record>
	{
		let keys = Object.keys(key);
		let search = (target : Record)=>
		{
			let ok = true;
			keys.forEach((entry)=>
			{
				if(key[entry] != (<any>target)[entry])
				{
					ok = false;
				}
			})
			return ok;
		}
		let all : Record[] = await (await this.readAll());
		let records : Record[] = all.filter(search);
		if(records.length > 0)
		{
			let keys = Object.keys(data);
			keys.forEach((entry)=>
			{
				(<any>records[0])[entry] = (<any>data)[entry];
			});
		}
		await this.writeRecords(all);
		return data;
	}

	async delete(key : any) : Promise<any>
	{
		let keys = Object.keys(key);
		let search = (target: Record)=>
		{
			let ok = true;
			keys.forEach((entry)=>
			{
				if(key[entry] != (<any>target)[entry])
				{
					ok = false;
				}
			})
			return ok;
		}
		let all : Record[] = await (await this.readAll());
		let records : Record[] = all.filter(search);
		if(records.length > 0)
		{
			let index = 0;
			records.forEach((entry)=>
			{
				index = all.indexOf(entry);
				all.splice(index, 1);
			});
			await this.writeRecords(all);
		}
	}

	async find(key : any, start : number = 1, limit : number = 10) : Promise<DBRecord>
	{
		let keys = Object.keys(key);
		let search = (target : Record)=>
		{
			let ok = true;
			keys.forEach((entry)=>
			{
				if(key[entry] != (<any>target)[entry])
				{
					ok = false;
				}
			})
			return ok;
		}

		let found : Record[] = (await this.readAll()).filter(search);
		let total = found.length;
		let firstPage = ((start - 1) * limit);
		var result = [];
		if(total > firstPage)
		{
			for(let i = 0, j = firstPage; j < total; ++i, ++j)
			{
				if(i >= limit)
				{
					break;
				}
				result.push(found[j]);
			}
		}
		return { data : result, total : total };
	}

	async fuzzyFind(property : string, filter : string, start : number = 1, limit : number = 10) : Promise<DBRecord>
	{
		let search = (target : Record)=>
		{
			let ok = true;
			let cvalue = (<any>target)[property];
			if(levenshtein(cvalue, filter) <= threshold)
			{
				return true;
			}
			return false;
		};

		let found : Record[] = (await this.readAll()).filter(search);
		let total = found.length;
		let firstPage = ((start - 1) * limit);
		var result = [];
		if(total > firstPage)
		{
			for(let i = 0, j = firstPage; j < total; ++i, ++j)
			{
				if(i >= limit)
				{
					break;
				}
				result.push(found[j]);
			}
		}
		return { data : result, total : total };
	}

}