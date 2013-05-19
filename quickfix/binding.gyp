# -*- mode: python -*-
{
    'default_configuration': 'Debug',
    'targets': [
        {
            'target_name': 'node_quickfix',
            'sources': [
                './src/stdafx.cpp',
                './src/stdafx.h',
                './src/main.cpp',
                './src/DataDictionary.hpp',
                './src/DataDictionary.cpp',
                './src/ObjectBuilder.hpp',
                './src/ObjectBuilder.cpp',
                './src/AsyncTask.hpp',
            ],
            'cflags': ['-fexceptions'],
            'cflags_cc': ['-fexceptions'],
            'ldflags': [
                '-lquickfix'
            ],
        },
    ],
}
