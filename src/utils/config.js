import yaml from 'js-yaml';
import { FileUtils } from './file.js';
import { Logger } from './logger.js';

export class ConfigUtils {
    /**
     * 讀取 YAML 設定檔
     */
    static async readYaml(filePath) {
        try {
            const content = await FileUtils.readFile(filePath);
            return yaml.load(content);
        } catch (error) {
            Logger.error(`讀取 YAML 檔案失敗 ${filePath}: ${error.message}`);
            throw error;
        }
    }

    /**
     * 寫入 YAML 設定檔
     */
    static async writeYaml(filePath, data) {
        try {
            const content = yaml.dump(data, {
                indent: 2,
                lineWidth: 120,
                noRefs: true
            });
            await FileUtils.writeFile(filePath, content);
        } catch (error) {
            Logger.error(`寫入 YAML 檔案失敗 ${filePath}: ${error.message}`);
            throw error;
        }
    }

    /**
     * 讀取 JSON 設定檔
     */
    static async readJson(filePath) {
        try {
            const content = await FileUtils.readFile(filePath);
            return JSON.parse(content);
        } catch (error) {
            Logger.error(`讀取 JSON 檔案失敗 ${filePath}: ${error.message}`);
            throw error;
        }
    }

    /**
     * 寫入 JSON 設定檔
     */
    static async writeJson(filePath, data, pretty = true) {
        try {
            const content = pretty 
                ? JSON.stringify(data, null, 2)
                : JSON.stringify(data);
            await FileUtils.writeFile(filePath, content);
        } catch (error) {
            Logger.error(`寫入 JSON 檔案失敗 ${filePath}: ${error.message}`);
            throw error;
        }
    }

    /**
     * 合併設定物件
     */
    static mergeConfig(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.mergeConfig(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    /**
     * 驗證設定結構
     */
    static validateConfig(config, schema) {
        const errors = [];
        
        for (const [key, rules] of Object.entries(schema)) {
            const value = config[key];
            
            if (rules.required && (value === undefined || value === null)) {
                errors.push(`必要欄位 '${key}' 遺失`);
                continue;
            }
            
            if (value !== undefined && rules.type && typeof value !== rules.type) {
                errors.push(`欄位 '${key}' 類型錯誤，期望 ${rules.type}，實際 ${typeof value}`);
            }
            
            if (rules.enum && !rules.enum.includes(value)) {
                errors.push(`欄位 '${key}' 值無效，必須是 ${rules.enum.join(', ')} 之一`);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
}
