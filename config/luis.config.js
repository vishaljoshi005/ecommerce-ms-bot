/* eslint-disable no-unused-vars */
const { LuisRecognizer } = require('botbuilder-ai');

class LuisConfig {
    constructor(config) {
        this.luis = new LuisRecognizer(config, {}, true);
        const entities = [];
    }

    async executeQuery(context) {
        return await this.luis.recognize(context);
    }

    getMyEntity(result) {
        if (result.luisResult.entities.length > 0) {
            const entityArray = [];
            const keyArray = result.luisResult.entities;

            keyArray.forEach((element) => {
                const obj = {};
                obj[element.type] = element.entity;
                entityArray.push(obj);
            });

            return entityArray;
        }
        return null;
    }

    getEntity(result) {
        if (result.luisResult.entities.length > 0) {
            // console.log(result.luisResult.entities[0].entity.toLowerCase());
            return result.luisResult.entities[0].entity.toLowerCase();
        }
        return null;
    }

    getProduct(result) {
        if (result.luisResult.entities.length > 0) {
            const keyArray = result.luisResult.entities;
            let type = '';

            keyArray.forEach((element) => {
                if (element.type === 'product') {
                    type = element.entity;
                }
            });

            return { product: type };
        }
        return null;
    }

    getSize(result) {
        if (result.luisResult.entities.length > 0) {
            const keyArray = result.luisResult.entities;
            let type = '';

            keyArray.forEach((element) => {
                if (element.type === 'size') {
                    type = element.entity;
                }
            });

            return { size: type };
        }
        return { size: null };
    }

    getColor(result) {
        if (result.luisResult.entities.length > 0) {
            const keyArray = result.luisResult.entities;
            let type = '';

            keyArray.forEach((element) => {
                if (element.type === 'color') {
                    type = element.entity;
                }
            });

            return { color: type };
        }

        return { color: null };
    }

    getBrand(result) {
        if (result.luisResult.entities.length > 0) {
            const keyArray = result.luisResult.entities;
            let type = '';

            keyArray.forEach((element) => {
                if (element.type === 'brand') {
                    type = element.entity;
                }
            });

            return { brand: type };
        }

        return { brand: null };
    }

    getGift(result) {
        if (result.luisResult.entities.length > 0) {
            const keyArray = result.luisResult.entities;
            let type = '';

            keyArray.forEach((element) => {
                if (element.type === 'gift') {
                    type = element.entity;
                }
            });

            return { gift: type };
        }

        return null;
    }

    // method to simply extract the entity
}

module.exports.LuisConfig = LuisConfig;
