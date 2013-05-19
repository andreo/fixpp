
#include "stdafx.h"

#include "DataDictionary.hpp"

#include <node.h>
#include <v8.h>

void init(v8::Handle<v8::Object> target)
{
  DataDictionary::Init(target);
}

NODE_MODULE(node_quickfix, init);
