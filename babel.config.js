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
                        "@/features": "./src/features",
                        "@/hooks": "./src/hooks",
                        "@/services": "./src/services",
                        "@/stores": "./src/stores",
                        "@/types": "./src/types",
                        "@/utils": "./src/utils",
                        "@/constants": "./src/constants",
                        "@/i18n": "./src/i18n",
                    },
                },
            ],
        ],
    };
};