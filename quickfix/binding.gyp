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
            'conditions': [
                [
                    'OS=="mac"', {
                        'xcode_settings': {
                            'GCC_PREFIX_HEADER': './src/stdafx.h',
                            'GCC_PRECOMPILE_PREFIX_HEADER': 'YES',
                            'OTHER_CPLUSPLUSFLAGS' : ['-fcxx-exceptions',],
                        },
                    },
                ],
                [
                    'OS=="linux"', {
                        'cflags_cc': ['-fexceptions'],
                    },
                ],
            ],
            'link_settings': {
                'libraries': [
                    '-lquickfix'
                ],
            },
        },
    ],
}
