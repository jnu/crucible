# Format description

This is the version 0 format.


## Header
```
Width: 105 bits
```
```
A      |B      |C      |D  |E                        |F                       |G             |H             |I             |J             |
-------|-------|-------|---|-------------------------|------------------------|--------------|--------------|--------------|--------------|
      7|      7|      7|  3|                       25|                      24|            14|            14|            14|            14|


 A   7 bits      uint        Format version
 B   7 bits      uint        Width of grid
 C   7 bits      uint        Height of grid
 D   3 bits      uint        Width of cell encoding in body
 E  25 bits      uint        Bits in clues section of body
 F  24 bits      uint        Bits in annotations section of body
 G  14 bits      uint        Bits in title section of body
 H  14 bits      uint        Bits in description section of body
 I  14 bits      uint        Bits in copyright section of body
 J  14 bits      uint        Bits in author section of body
```

## Body

The body has three parts:
 1. Grid
 2. Clues
 3. Annotations
They are each independent sections of variable width parsed independently.

### Grid
```
Offset:          105 bits
Max width:   112,903 bits
```

Variable, according to the header. There will be B*C segments, each with a bit
width of D.

```
a_0|a_1|a_2|...|a_{B*C - 1}|
 -?| -?| -?|...|         -?|
  D|  D|  D|...|          D|


 a   D bits       uint      Cell content. 0 indicates empty, 1 indicates a
                            block. Further values refer to the Character
                            Table. Future formats may wish to specify a
                            custom character table.
```

### Clues
```
Offset:     105 + B*C*D bits
Max width: 33,554,432 bits
```

Variable length, specified by E in header.

```
a_0       |b_0|c_0         |d_0|...
----------|  -|------------| -?|...
        10|  1|          12|c_0|...


 a   10 bits     uint       Index of clue
 b    1 bit      bool       Across or Down (Across=0, Down=1)
 c   12 bits     uint       Length in bytes of encoded clue body
 d  c*8 bits     uint[]     Array of UTF-8 unicode code points
```

### Annotations
```
Offset:    105 + B*C*D + E bits
Max width:      16,777,215 bits
```

Variable length, specified by F in header.

```
a_0             |b_0| c_0|d_0|...
----------------|---|----| -?|...
              16|  3|   4|c_0|...


 a   16 bits     uint        Index of annotated cell
 b    3 bits     uint        Type of annotation (see appendix 2)
 c    4 bits     uint        Length of annotation content
 d  8*c bits     uint[]      Array of UTF-8 unicode code points
```

### Meta data

Four fields whose length is specified in the header

```
Max length (each):  196,596 bits

G    Title          uint[]   Array of UTF-8 unicode code points
H    Description      "                       "
I    Copyright        "                       "
J    Author           "                       "
```

### Timestamps

Two fields that represent timestamps:

```
Length (each):  32 bits

1. Created TS          uint    Seconds since the epoch
2. Last modified TS      "               "
```

# Appendix 1 - Character Table

```
 WIDTH 1
  0    {BLOCK}
  1    {EMPTY}
 WIDTH 4
  2    A
  3    B
  4    C
  5    D
  6    E
  7    F
  8    G
  9    H
 10    I
 11    J
 12    K
 13    L
 14    M
 15    N
 16    O
 17    P
 18    Q
 19    R
 20    S
 21    T
 22    U
 23    V
 24    W
 25    X
 26    Y
 27    Z
 28    ?
 29    -
 30    /
 31    !
 WIDTH 5
 {TODO}
```


# Appendix 2 - Annotation types

```
 0    Circle
 1    Rebus
 2    {UNUSED}
 3    {UNUSED}
```
