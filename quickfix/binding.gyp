# -*- mode: python -*-
{
    'targets': [
        {
            'target_name': 'node_quickfix',
            'sources': [
                './src/stdafx.cpp',
                './src/stdafx.h',
                './src/main.cpp',
                './src/v8util.hpp',
                './src/DataDictionary.hpp',
                './src/DataDictionary.cpp',
                './src/Message.hpp',
                './src/Message.cpp',
                './src/ObjectBuilder.hpp',
                './src/ObjectBuilder.cpp',
                './src/AsyncTask.hpp',
            ],
            'cflags': ['-fexceptions'],
            'cflags_cc': ['-fexceptions'],
            'link_settings': {
                'libraries': [
                    '-lquickfix'
                    ],
            },
        },
    ],
}
