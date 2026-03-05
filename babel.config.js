module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            [
                "module-resolver",
                {
                    root: ["./"],
                    alias: {
                        "@/components": "./src/components",
                        "@/config": "./src/config",
                        "@/hooks": "./src/hooks",
                        "@/services": "./src/services",
                        "@/stores": "./src/stores",
                        "@/types": "./src/types",
                        "@/utils": "./src/utils",
                        "@/constants": "./src/constants",
                        "@/i18n": "./src/i18n",
                        "@/assets": "./src/assets",
                        "@/contexts": "./src/contexts",
                    },
                },
            ],
        ],
    };
};