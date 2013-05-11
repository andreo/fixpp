define(
    [],
    function () {
	return {
	    header: [
		{
		    field: 8,
		    name: "BeginString",
		    value: "FIXT.1.1"
		}
	    ],
	    body: {
		fields: [
		    {
			field: 10,
			value: "089"
		    },
		    {
			field: 10,
			name: "CheckSum",
			value: "089",
			enum: "EnumValue"
		    }
		],
		groups: [
		    {
			groupName: "NoAlloc",
			groupField: 111,
			fields: [
			    {
				field: 10,
				value: "089"
			    },
			    {
				field: 10,
				name: "CheckSum",
				value: "089",
				enum: "EnumValue"
			    }
			]
		    }
		]
	    },
	    trailer: [
		{
		    field: 10,
		    name: "CheckSum",
		    value: "089"
		}
	    ]
	};
    });
