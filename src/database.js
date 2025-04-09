import fs from "node:fs/promises";
const databasePath = new URL("../db.json", import.meta.url);

export class Database {
    #database = {};

    constructor(){
        fs.readFile(databasePath, "utf8").then(data => {
            this.#database = JSON.parse(data);
        }).catch(() => {
            this.#persist()
        })
    }

    #persist(){
        fs.writeFile(databasePath, JSON.stringify(this.#database));
    }

    select(table, search){
        let data = this.#database[table] ?? {};

        if(search){
            data = Object.entries(data).reduce((acc, [subTable, rows]) => {
                acc[subTable] = rows.filter(row => {
                    return Object.entries(search).some(([Key, value]) => {
                        if(!value) return true;
                        return row[Key]?.toLowerCase().includes(value.toLowerCase());
                    });
                });
                return acc
            }, {});
        }
        return data
    }

    insert(table,subTable, data){
        if(!this.#database[table]){
            this.#database[table] = {};
        }

        if(!this.#database[table][subTable]){
            this.#database[table][subTable] = [];
        }

        this.#database[table][subTable].push(data);
        this.#persist()
        return data;
    };

    
        update(table, search, data){
            const rowIndex = this.#database[table].findIndex(row => {
                return row.medicine === search
            })
    
            if(rowIndex > -1){
                const row = this.#database[table][rowIndex]
                this.#database[table][rowIndex]= {...row, ...data}
                this.#persist()
            }
    }


    delete(table, name) {
        let deleted = false;

       
        Object.entries(this.#database[table] || {}).forEach(([subTable, rows]) => {   
            const newRows = rows.filter(row => !row.queryMedicine.toLowerCase().includes(name.toLowerCase()));

          
            if (newRows.length < rows.length) {
                this.#database[table][subTable] = newRows; 
                deleted = true;
            }

            if(newRows.length === 0) {
                delete this.#database[table][subTable]
            }
        });

        
        if (deleted) {
            this.#persist();
            return true; 
        }

        return false;  
    }

};