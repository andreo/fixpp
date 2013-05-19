
#include "stdafx.h"

#include "DataDictionary.hpp"
#include "Message.hpp"

#include <node.h>
#include <v8.h>

void init(v8::Handle<v8::Object> target)
{
  DataDictionary::Init(target);
  Message::Init(target);
}

NODE_MODULE(node_quickfix, init);
