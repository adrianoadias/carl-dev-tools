import { FileUtils } from './file.js';
import { Logger } from './logger.js';

export class EnvValidator {
    /**
     * 驗證環境檔案格式
     */
    static async validateFormat(filePath) {
        const results = {
            valid: true,
            errors: [],
            warnings: []
        };

        try {
            // 檢查檔案是否存在
            if (!(await FileUtils.exists(filePath))) {
                results.valid = false;
                results.errors.push(`檔案不存在: ${filePath}`);
                return results;
            }

            const content = await FileUtils.readFile(filePath);
            const lines = content.split('\n');
            const keys = new Set();

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                const lineNumber = i + 1;

                // 跳過空行和註解
                if (!line || line.startsWith('#')) {
                    continue;
                }

                // 檢查基本格式 KEY=VALUE
                if (!line.includes('=')) {
                    results.errors.push(`第 ${lineNumber} 行格式錯誤: ${line}`);
                    results.valid = false;
                    continue;
                }

                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=');

                // 檢查 key 格式
                if (!key || key.trim() === '') {
                    results.errors.push(`第 ${lineNumber} 行缺少變數名稱: ${line}`);
                    results.valid = false;
                    continue;
                }

                // 檢查重複的 key
                if (keys.has(key)) {
                    results.errors.push(`重複的變數名稱: ${key}`);
                    results.valid = false;
                } else {
                    keys.add(key);
                }

                // 檢查可能的問題
                if (value === '') {
                    results.warnings.push(`變數 ${key} 的值為空`);
                }
            }

        } catch (error) {
            results.valid = false;
            results.errors.push(`驗證過程發生錯誤: ${error.message}`);
        }

        return results;
    }

    /**
     * 檢查必要變數
     */
    static async checkRequired(filePath, requiredVars = []) {
        const results = {
            valid: true,
            missing: [],
            empty: []
        };

        try {
            const envVars = await this.parseEnvFile(filePath);

            for (const requiredVar of requiredVars) {
                if (!(requiredVar in envVars)) {
                    results.missing.push(requiredVar);
                    results.valid = false;
                } else if (envVars[requiredVar] === '') {
                    results.empty.push(requiredVar);
                    results.valid = false;
                }
            }

        } catch (error) {
            results.valid = false;
            results.error = error.message;
        }

        return results;
    }

    /**
     * 基本安全檢查
     */
    static async securityCheck(filePath) {
        const warnings = [];

        try {
            const content = await FileUtils.readFile(filePath);
            const lines = content.split('\n');

            // 檢查常見的不安全值
            const unsafePatterns = [
                { pattern: /password.*=.*(123456|password|admin|root)/i, message: '偵測到可能的預設密碼' },
                { pattern: /secret.*=.*(secret|test|demo)/i, message: '偵測到可能的測試金鑰' },
                { pattern: /key.*=.*(your-key|change-this|example)/i, message: '偵測到範例金鑰值' }
            ];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                const lineNumber = i + 1;

                for (const { pattern, message } of unsafePatterns) {
                    if (pattern.test(line)) {
                        warnings.push(`第 ${lineNumber} 行: ${message}`);
                    }
                }
            }

        } catch (error) {
            Logger.error(`安全檢查失敗: ${error.message}`);
        }

        return warnings;
    }

    /**
     * 解析環境檔案為物件
     */
    static async parseEnvFile(filePath) {
        const envVars = {};
        
        try {
            const content = await FileUtils.readFile(filePath);
            const lines = content.split('\n');

            for (const line of lines) {
                const trimmedLine = line.trim();
                
                // 跳過空行和註解
                if (!trimmedLine || trimmedLine.startsWith('#')) {
                    continue;
                }

                const equalIndex = trimmedLine.indexOf('=');
                if (equalIndex === -1) {
                    continue;
                }

                const key = trimmedLine.substring(0, equalIndex).trim();
                const value = trimmedLine.substring(equalIndex + 1).trim();

                if (key) {
                    envVars[key] = value;
                }
            }

        } catch (error) {
            Logger.error(`解析環境檔案失敗: ${error.message}`);
            throw error;
        }

        return envVars;
    }
}
