import { prisma } from "../src/database/db"
import  Logger from '../src/utils/Logger';

const data : any ={
	"id": 1,
	"role": {
		"id": 1,
		"menu_status": [
			{
				"code": "PROF",
				"type": "USER",
				"visible": true
			},
			{
				"code": "CHNGPSS",
				"type": "USER",
				"visible": true
			},
			{
				"code": "CHNGPIC",
				"type": "USER",
				"visible": true
			}
		],
		"name": "Superuser",
		"permissions": [
			{
				"permission": {
					"key": "C"
				},
				"section": {
					"code": "DSHB"
				}
			},
			{
				"permission": {
					"key": "R"
				},
				"section": {
					"code": "DSHB"
				}
			},
			{
				"permission": {
					"key": "U"
				},
				"section": {
					"code": "DSHB"
				}
			},
			{
				"permission": {
					"key": "D"
				},
				"section": {
					"code": "DSHB"
				}
			},
			{
				"permission": {
					"key": "C"
				},
				"section": {
					"code": "PREVMTO"
				}
			}
		]
	}
}

/* describe("getRolDataResolver", () => {
    test("Test Model", async () => {
        const result = await getRolDataResolver(null, { uid: "Butbz0uTFMOiDzgDqY7oWOi46xv2" }, { db: prisma, headers: {}, log: Logger.getInstance() });
        
        let res = data.role.menu_status.find((e) => e.code === 'CHNGPSS')
        console.log(res)
    }); 
    
}); */

const sum = (a, b) => {
    return a + b
}

test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
});